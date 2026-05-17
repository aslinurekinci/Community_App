Proje Temel Kuralları
Genel Mimari: Geliştirme sürecinde iş mantığı kesinlikle /screens klasöründe tutulmamalı; proje /components, /context, /hooks, /services, /constants ve /utils gibi anlamlı klasör yapılarına bölünmelidir
. Uygulamanın genel veri akışı için AuthContext, PostContext, NotificationContext ve ThemeContext olmak üzere 4 ayrı Context mimarisi kullanılmalıdır
. Sihirli sayılar (magic numbers) kullanmak yasaktır ve API limitleri, renkler, boyutlar gibi veriler /constants altında tanımlanmalıdır
.
Optimistik UI Standartları: Projedeki en kritik teknik zorunluluk optimistik arayüz güncellemeleridir; beğeni ve gönderi oluşturma gibi yazma işlemlerinde API cevabı beklenmeden önce UI anlık olarak güncellenmeli, ardından API'ye istek atılmalı ve sadece hata durumunda yapılan işlem geri alınmalıdır (rollback)
.
API (DummyJSON) Kuralları: Tüm veri işlemleri https://dummyjson.com base URL'i üzerinden yapılmalıdır
. Uygulamada sunucu taraflı push bildirimler bulunmadığı için bildirimler API eylemlerine (örneğin gönderi paylaşma) dayalı olarak NotificationContext üzerinden yerel olarak tetiklenmelidir
. Tüm fetch işlemleri /services altındaki dosyalarda izole edilmelidir
.
Navigasyon Mimarisi
İç İçe (Nested) Navigasyon: Uygulamada sadece Stack Navigator kullanımı yeterli değildir, Bottom Tab Navigator içerisinde Stack Navigator kurularak iç içe bir mimari sağlanmalıdır
.
Ana Yönlendirme: En üstte yer alan App Navigator (Stack), kullanıcının durumuna göre iki ana hedefe yönlenir: Token yoksa Auth Stack: Login ekranı açılır, token varsa Main (Tab Navigator) yapısına yönlendirilir
.
Sekme Yapısı ve Geçişler:
Keşfet (Explore) sekmesi kendi içinde ayrı bir stack yapısına sahip olmalıdır (Explore -> TagFeed -> Post Detail)
.
Gönderi Oluşturma (Create Post) ekranı sekme navigasyonunda (Tab 3) yer almasına rağmen modal (Modal Stack) gibi davranmalıdır
. İşlem tamamlandıktan sonra navigation.goBack() kullanılması yeterli değildir; kullanıcıyı doğrudan Feed (Akış) sekmesine navigate fonksiyonu ile geçiş yaptırmalısınız
.
Ekran Geliştirme Rehberi (Benim Görevlerim)
Login Ekranı:
API Bağlantısı: Giriş işlemleri için POST /auth/login endpoint'i kullanılmalıdır ve test için username: emilys, password: emilyspass bilgileri atanmıştır
.
Form Doğrulama: Şifre alanı secureTextEntry olmalıdır; her iki alan da boşsa kullanıcıya hata mesajı gösterilmeli ve olası API hataları UI üzerinde belirtilmelidir
.
Token ve Loading: İstek sırasında giriş butonu devre dışı bırakılıp ActivityIndicator gösterilmelidir
. Başarılı bir giriş sonrası alınan Token ve kullanıcı verisi AuthContext içine kaydedilip ana navigasyona (Tab Navigator) yönlendirilmelidir
. Eğer sistemde halihazırda geçerli bir token varsa, Login ekranı gösterilmemeli ve doğrudan Feed ekranına geçilmelidir
.
Keşfet Ekranı:
API Bağlantısı: Etiket filtreleri için GET /posts/tags, etikete göre verileri listelemek için GET /posts/tag/{tag} kullanılmalıdır
.
Listeleme Özellikleri: API'den çekilen tüm etiketler tıklanabilir rozetler olarak FlatList benzeri yapılarla gösterilmeli ve popüler etiketlerin yanında onlara ait gönderi sayıları yer almalıdır
. Kullanıcılar etiket ismine göre istemci tarafında (client-side) arama yapabilmelidir
.
TagFeed ve Geçişler: Herhangi bir etikete tıklandığında TagFeed adında ayrı bir stack ekranında o etiketin gönderileri listelenmelidir
. Bu listedeki gönderi kartlarında yer alan beğeni butonu da ana Feed ile senkronize çalışarak optimistik yapıları desteklemeli ve tıklandığında PostDetail ekranına gitmelidir
.
Gönderi Oluşturma Ekranı:
Girdi Alma: Ekran, zorunlu bir 'Başlık' alanı ve minimum 20 karakter sınırına sahip zorunlu bir 'Gövde' alanı içermelidir
. Gövde alanı için anlık karakter sayacı (örn: 45 / 500) bulundurulmalı ve GET /posts/tags üzerinden alınan etiketlerden en fazla 3 tane seçilebilmelidir
.
Form Validasyonu: Form alanlarından biri boş kalırsa veya 20 karakterlik minimum gövde şartı sağlanmazsa, 'Paylaş' butonu aktif olmamalıdır ve hangi alanın eksik olduğuna dair özel hata mesajı görünmelidir
.
DummyJSON ile Optimistik Post Simülasyonu: 'Paylaş' butonuna tıklandığında anlık olarak 3 işlem gerçekleşmelidir; (1) Yeni gönderi PostContext içerisindeki mevcut posts dizisinin en başına eklenmeli, (2) POST /posts endpoint'ine veri gönderilmeli, (3) NotificationContext kullanılarak addNotification() ile 'Gönderiniz paylaşıldı.' bildirimi oluşturulmalıdır
.
Hata Yönetimi ve Temizleme: Eğer post etme işlemi API bazlı bir hataya düşerse, sahte gönderi diziden geri çekilmeli ve ekrana bir hata mesajı sunulmalıdır
. Başarı durumunda ise içerik sıfırlanarak Feed'e yönlendirme yapılmalıdır
.