import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import apiClient from '../client';
import { usePost } from '../context/PostContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const BLUE = '#1C6EF2';
const MAX_BODY = 500;
const MIN_BODY = 20;
const MAX_TAGS = 3;

const CreatePost = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { addPost, removePost } = usePost();
  const { addNotification } = useNotification();
  const { user } = useAuth();

  // Etiketleri API'den çek
  useEffect(() => {
    apiClient
      .get('/posts/tags')
      .then(({ data }) => {
        const slugs = data.map((t) => (typeof t === 'object' ? t.slug : t));
        setAvailableTags(slugs.slice(0, 10));
      })
      .catch(() => {
        setAvailableTags(['yaşam', 'teknoloji', 'sanat', 'gündem', 'spor', 'müzik', 'sinema']);
      });
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Başlık zorunludur.';
    if (!body.trim()) e.body = 'Açıklama zorunludur.';
    else if (body.trim().length < MIN_BODY) e.body = `En az ${MIN_BODY} karakter girilmelidir.`;
    return e;
  };

  const canShare = title.trim().length > 0 && body.trim().length >= MIN_BODY;

  const handleShare = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);

    // 1. Optimistik: Gönderiyi anında ekle
    const tempId = `temp-${Date.now()}`;
    const optimisticPost = {
      id: tempId,
      title: title.trim(),
      body: body.trim(),
      tags: selectedTags,
      userId: user?.id ?? 1,
      reactions: { likes: 0, dislikes: 0 },
      views: 0,
    };
    addPost(optimisticPost);

    try {
      // 2. API isteği
      const { data } = await apiClient.post('/posts/add', {
        title: title.trim(),
        body: body.trim(),
        tags: selectedTags,
        userId: user?.id ?? 1,
      });

      // Gerçek ID ile güncelle: temp kaydı sil, gerçeği ekle
      removePost(tempId);
      addPost({ ...optimisticPost, id: data.id });

      // 3. Bildirim
      addNotification('Gönderiniz paylaşıldı. 🎉');

      // 4. Temizle ve Feed'e yönlendir
      setTitle('');
      setBody('');
      setSelectedTags([]);
      navigation.navigate('Feed');
    } catch {
      // Hata: optimistik gönderiyi geri al
      removePost(tempId);
      setErrors({ api: 'Gönderi paylaşılamadı. Lütfen tekrar dene.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity id="create-close" onPress={() => navigation.goBack()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gönderi Oluştur</Text>
        <TouchableOpacity
          id="create-share-btn"
          style={[styles.shareBtn, !canShare && styles.shareBtnDisabled]}
          onPress={handleShare}
          disabled={!canShare || loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.shareBtnText}>Paylaş</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* API Hatası */}
        {errors.api ? (
          <View style={styles.apiErrorBox}>
            <Text style={styles.apiErrorText}>⚠️ {errors.api}</Text>
          </View>
        ) : null}

        {/* Başlık */}
        <Text style={styles.label}>Başlık <Text style={styles.required}>*</Text></Text>
        <View style={[styles.inputBox, errors.title && styles.inputBoxError]}>
          <TextInput
            id="create-title"
            style={styles.textInput}
            placeholder="Gönderiye bir başlık ekle..."
            placeholderTextColor="#B0B0B0"
            value={title}
            onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: '' })); }}
          />
        </View>
        {errors.title ? <Text style={styles.fieldError}>{errors.title}</Text> : null}

        {/* Görsel Yükleme (simüle) */}
        <Text style={styles.label}>Gönderi Görseli <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity id="create-image-upload" style={styles.imageUpload} activeOpacity={0.8}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.imageUploadText}>Görsel Yükle (zorunlu)</Text>
        </TouchableOpacity>

        {/* Açıklama */}
        <Text style={styles.label}>Açıklama</Text>
        <View style={[styles.inputBox, styles.bodyBox, errors.body && styles.inputBoxError]}>
          <TextInput
            id="create-body"
            style={styles.bodyInput}
            placeholder="Gönderinizin içeriğini buraya yazın..."
            placeholderTextColor="#B0B0B0"
            value={body}
            onChangeText={(v) => {
              if (v.length <= MAX_BODY) {
                setBody(v);
                setErrors((e) => ({ ...e, body: '' }));
              }
            }}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCounter}>{body.length} / {MAX_BODY}</Text>
        </View>
        {errors.body ? <Text style={styles.fieldError}>{errors.body}</Text> : null}

        {/* Etiket Seçimi */}
        <Text style={styles.label}>Etiket Seçimi</Text>
        <View style={styles.tagsWrap}>
          {availableTags.map((tag) => {
            const active = selectedTags.includes(tag);
            const disabled = !active && selectedTags.length >= MAX_TAGS;
            return (
              <TouchableOpacity
                id={`tag-${tag}`}
                key={tag}
                style={[styles.tagChip, active && styles.tagChipActive, disabled && styles.tagChipDisabled]}
                onPress={() => !disabled && toggleTag(tag)}
                activeOpacity={0.75}>
                <Text style={[styles.tagText, active && styles.tagTextActive]}>
                  # {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bilgi Notu */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Paylaştığınız içeriklerin topluluk kurallarına uygun olduğundan emin olun.{' '}
            Başlık ve görsel alanları zorunludur.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EAEAEA', backgroundColor: '#fff',
  },
  closeIcon: { fontSize: 18, color: '#555', padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  shareBtn: {
    backgroundColor: BLUE, paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, minWidth: 64, alignItems: 'center',
  },
  shareBtnDisabled: { backgroundColor: '#B0C8F8' },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { padding: 16, paddingBottom: 40 },
  apiErrorBox: {
    backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#FFCDD2',
  },
  apiErrorText: { color: '#C62828', fontSize: 13 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 6, marginTop: 16 },
  required: { color: '#E53E3E' },
  inputBox: {
    borderWidth: 1.5, borderColor: '#D0E8FF', borderRadius: 10,
    borderStyle: 'dashed', paddingHorizontal: 12,
  },
  inputBoxError: { borderColor: '#E53E3E' },
  textInput: { fontSize: 15, color: '#1A1A1A', paddingVertical: 12 },
  fieldError: { color: '#E53E3E', fontSize: 12, marginTop: 4 },
  imageUpload: {
    borderWidth: 1.5, borderColor: '#D0E8FF', borderStyle: 'dashed',
    borderRadius: 10, height: 110, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8FBFF',
  },
  cameraIcon: { fontSize: 28, marginBottom: 8 },
  imageUploadText: { fontSize: 14, color: '#888' },
  bodyBox: { minHeight: 130 },
  bodyInput: { fontSize: 15, color: '#1A1A1A', paddingVertical: 12, minHeight: 100 },
  charCounter: { textAlign: 'right', fontSize: 12, color: '#AAA', paddingBottom: 6 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: BLUE, marginBottom: 4,
  },
  tagChipActive: { backgroundColor: '#0A4DBF' },
  tagChipDisabled: { backgroundColor: '#D0D0D8' },
  tagText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  tagTextActive: { color: '#fff' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', marginTop: 20,
    backgroundColor: '#F0F6FF', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#D0E4FF',
  },
  infoIcon: { fontSize: 16, marginRight: 8, marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
});

export default CreatePost;
