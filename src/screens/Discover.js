import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  StatusBar,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';

const BASE = 'https://dummyjson.com';
const STATUS_H = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;
const { width: SW } = Dimensions.get('window');
const BLUE = '#1C6EF2';
const COL = (SW - 48) / 2;
const HEIGHTS = [170, 220, 190, 250, 180, 230, 200, 240];
const imgH = (id) => HEIGHTS[id % HEIGHTS.length];

const Discover = ({ navigation }) => {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [postsLoading, setPostsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const searchTimer = useRef(null);

  // ── Tag'ları çek ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/posts/tags`)
      .then((r) => r.json())
      .then((data) => {
        const normalized = data.map((t) =>
          typeof t === 'object' ? { slug: t.slug, label: t.name } : { slug: t, label: t },
        );
        setTags(normalized);
      })
      .catch(() => setTags([]))
      .finally(() => setTagsLoading(false));
  }, []);

  // ── Arama: eşleşen tag varsa o tag'ın postlarını çek ────────
  const handleSearch = (text) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (!text.trim()) {
        setSelectedTag('all');
        return;
      }
      const lower = text.trim().toLowerCase();
      const matched = tags.find(
        (t) =>
          t.label.toLowerCase().includes(lower) ||
          t.slug.toLowerCase().includes(lower),
      );
      if (matched) {
        setSelectedTag(matched.slug);
      }
    }, 400);
  };

  // ── Gönderileri çek ───────────────────────────────────────────
  const loadPosts = useCallback(async (tag) => {
    setPostsLoading(true);
    try {
      const url =
        tag === 'all'
          ? `${BASE}/posts?limit=20`
          : `${BASE}/posts/tag/${tag}?limit=20`;
      const r = await fetch(url);
      const data = await r.json();
      setPosts(data.posts ?? []);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(selectedTag);
  }, [selectedTag, loadPosts]);

  // ── İstemci tarafı arama ──────────────────────────────────────
  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.body.toLowerCase().includes(search.toLowerCase()),
  );

  const leftPosts = filtered.filter((_, i) => i % 2 === 0);
  const rightPosts = filtered.filter((_, i) => i % 2 !== 0);

  // ── Gönderi Kartı ─────────────────────────────────────────────
  const PostCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { width: COL }]}
      activeOpacity={0.88}
      onPress={() =>
        navigation?.navigate('PostDetail', { post: item })
      }>
      {/* Mock görsel (API'de yok, picsum kullanıyoruz) */}
      <Image
        source={{
          uri: `https://picsum.photos/seed/${item.id}/${Math.round(COL)}/${imgH(item.id)}`,
        }}
        style={[styles.cardImg, { height: imgH(item.id) }]}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        {/* Başlık — API'den */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {/* Etiketler — API'den (post.tags[]) */}
        {item.tags?.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.slice(0, 2).map((t) => (
              <View key={t} style={styles.badge}>
                <Text style={styles.badgeText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}
        {/* İstatistikler — API'den */}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>👁 {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</Text>
          <Text style={styles.meta}>❤️ {item.reactions?.likes ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Tag Chip ──────────────────────────────────────────────────
  const TagChip = ({ slug, label }) => {
    const active = selectedTag === slug;
    return (
      <TouchableOpacity
        style={[styles.chip, active && styles.chipOn]}
        onPress={() => setSelectedTag(slug)}
        activeOpacity={0.75}>
        <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── UI ────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      {/* Arama — tag eşleşmesi varsa API'den yükler */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Keşfet..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); setSelectedTag('all'); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tag Chipleri — API'den */}
      {tagsLoading ? (
        <ActivityIndicator color={BLUE} style={{ margin: 12 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipBar}
          contentContainerStyle={styles.chipBarContent}>
          <TagChip slug="all" label="Tümü" />
          {tags.map((t) => (
            <TagChip key={t.slug} slug={t.slug} label={t.label} />
          ))}
        </ScrollView>
      )}

      {/* Gönderi Listesi — API'den */}
      {postsLoading ? (
        <ActivityIndicator color={BLUE} size="large" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Gönderi bulunamadı.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}>
          <View style={styles.cols}>
            {/* Sol sütun */}
            <FlatList
              data={leftPosts}
              keyExtractor={(p) => `L${p.id}`}
              renderItem={({ item }) => <PostCard item={item} />}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
            <View style={{ width: 8 }} />
            {/* Sağ sütun */}
            <FlatList
              data={rightPosts}
              keyExtractor={(p) => `R${p.id}`}
              renderItem={({ item }) => <PostCard item={item} />}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: STATUS_H + 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
    marginVertical: 10, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: '#EAEAEA',
  },
  clearBtn: { fontSize: 16, color: '#aaa', paddingHorizontal: 4 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 12 },
  chipBar: { maxHeight: 50 },
  chipBarContent: { paddingHorizontal: 16, alignItems: 'center', flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F0F0F5', marginRight: 8,
  },
  chipOn: { backgroundColor: BLUE },
  chipTxt: { fontSize: 13, color: '#555', fontWeight: '600' },
  chipTxtOn: { color: '#fff' },
  grid: { padding: 16, paddingBottom: 40 },
  cols: { flexDirection: 'row' },
  card: {
    borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardImg: { width: '100%' },
  cardBody: { padding: 8 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 5, lineHeight: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 5 },
  badge: { backgroundColor: '#EEF3FF', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, color: BLUE, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 8 },
  meta: { fontSize: 11, color: '#777' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: '#aaa' },
});

export default Discover;
