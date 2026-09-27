# PROJE: Ekip Yönetimi, Proje ve Müşteri Yönetim Paneli

Supabase mcp bağlı. İlgili tablo ,storage vs ekleyebilirisn. Supabase tam erişimin var.

Mevcut Next.js projem üzerinde modern, sade ve hızlı bir ekip yönetim uygulaması geliştirmeni istiyorum.

Bu uygulama 4-10 kişilik küçük bir SaaS/yazılım ekibinin;

* ekip üyelerini,
* görevlerini,
* projelerini,
* müşterilerini,
* SaaS aboneliklerini,
* şirket hedeflerini

tek bir panel üzerinden yönetebilmesi için kullanılacaktır.

Uygulamayı gereksiz özelliklerle karmaşıklaştırma. Trello benzeri görev yönetimi ile hafif CRM ve proje yönetimini birleştiren sade bir operasyon paneli istiyorum.

## 1. TEKNOLOJİ

Mevcut Next.js projesini kullan.

Teknolojiler:

* Next.js
* JavaScript
* TypeScript KULLANMA.
* Tailwind CSS
* Supabase
* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* Lucide Icons kullanılabilir.

Kod yapısı temiz, modüler ve tekrar kullanılabilir component mantığında olmalıdır.

Uygulama tamamen responsive olmalıdır.

Şu ekranlarda sorunsuz çalışmalıdır:

* Desktop
* Laptop
* Tablet
* Mobil

Desktop tasarlayıp sonradan mobile sıkıştırma. Responsive davranışları componentleri geliştirirken baştan düşün.

---

# 2. TASARIM DİLİ

Modern SaaS dashboard görünümü istiyorum.

Tasarım:

* sade
* profesyonel
* minimal
* hızlı anlaşılır
* ferah
* gereksiz renklerden uzak

olsun.

Kartlarda hafif border ve gerektiğinde çok hafif shadow kullanılabilir.

Border radius orta seviyede olsun.

Durum, öncelik ve etiketlerde renk kullanılabilir ancak ekranı rengarenk yapma.

Ana layout:

Desktop:

Sidebar + Header + Content

Mobil:

Header + hamburger menü + drawer sidebar

Sidebar daraltılabilir olabilir.

Loading durumlarında skeleton kullan.

Boş ekranlarda kullanıcıya ne yapması gerektiğini anlatan empty-state componentleri kullan.

Toast bildirimleri kullan.

Silme işlemlerinde confirmation dialog göster.

---

# 3. AUTHENTICATION

Signup sistemi OLMAYACAK.

Kullanıcıları Supabase Auth içerisinden manuel olarak ben oluşturacağım.

Örneğin:

[ali@ekip.com](mailto:ali@ekip.com)
[mehmet@ekip.com](mailto:mehmet@ekip.com)
[sabri@ekip.com](mailto:sabri@ekip.com)

Ancak kullanıcı giriş ekranında email adresi girmeyecek.

Login ekranı sadece:

Kullanıcı Adı
Şifre

alanlarından oluşacak.

Örneğin kullanıcı:

ali

yazarsa frontend bunu:

[ali@ekip.com](mailto:ali@ekip.com)

haline getirerek Supabase Auth'a gönderecek.

Domain sabit olarak:

@ekip.com

olsun.

Login ekranında:

* logo/uygulama adı
* Kullanıcı Adı
* Şifre
* Giriş Yap

bulunsun.

Signup butonu OLMASIN.

Giriş yapılmamış kullanıcı dashboard sayfalarına erişemesin.

---

# 4. KULLANICI PROFİLLERİ

Supabase Auth kullanıcılarına bağlı profiles tablosu oluştur.

Örnek alanlar:

id
auth_user_id
username
full_name
avatar_url
role
job_title
is_active
created_at
updated_at

Roller başlangıçta:

admin
member
freelancer

olabilir.

Admin her şeyi yönetebilir.

Member yetkisi olan proje ve kayıtları görebilir.

Freelancer sadece dahil edildiği proje ve kendisine atanmış işleri görebilecek şekilde tasarlanabilmelidir.

Yetkilendirme altyapısını ileride genişletebileceğimiz şekilde kur.

---

# 5. ANA NAVİGASYON

Sidebar:

Ana Sayfa
İşler
Projeler
Müşteriler
Abonelikler
Ekip

Alt bölüm:

Ayarlar

Mobilde sidebar drawer olarak açılsın.

---

# 6. ANA SAYFA / DASHBOARD

Dashboard uygulamanın genel operasyon durumunu hızlı şekilde göstermeli.

Üst tarafta özet kartları:

Aktif Müşteriler
Aktif Projeler
Açık Görevler
Geciken Görevler

göster.

## ŞİRKET HEDEFLERİ

Ana sayfada "Hedefler" bölümü olsun.

Birden fazla hedef oluşturulabilsin.

Hedef alanları:

* Başlık
* Açıklama
* Başlangıç tarihi
* Bitiş tarihi
* Hedef değer
* Mevcut değer
* Progress yüzdesi
* Durum
* İsteğe bağlı proje ilişkisi

Progress bar ile göster.

Örneğin:

500 Aktif Müşteri

347 / 500

%69

74 gün kaldı

Kalan gün sayısını sistem otomatik hesaplasın.

Bitiş tarihi geçmişse uygun şekilde "Süre Doldu" göster.

Hedef durumları:

Devam Ediyor
Tamamlandı
İptal

Hedefleri tüm ekip üyeleri ana sayfada görebilsin.

Yetkili kullanıcı hedef ekleyebilsin, düzenleyebilsin ve silebilsin.

## BENİM GÖREVLERİM

Login olan kullanıcının kendisine atanmış görevlerinden:

Bugün
Yaklaşan
Geciken

görevleri göster.

## GECİKEN GÖREVLER

Ana sayfada ayrıca özellikle görünür bir "Geciken Görevler" bölümü olsun.

Burada örneğin:

Landing Page Güncelle
Mesajify
3 gün gecikti
Ali, Mehmet

gibi bilgiler gösterilsin.

ÇOK ÖNEMLİ:

Bir göreve BİRDEN FAZLA kullanıcı atanabilir.

Bu nedenle geciken görevlerde göreve atanmış TÜM ekip üyelerinin:

* avatarı
* adı

gösterilmelidir.

Kullanıcı sayısı fazla olduğunda örneğin:

Ali
Mehmet
+2

şeklinde kompakt gösterim yapılabilir.

## SON AKTİVİTELER

Ana sayfada son aktiviteler gösterilebilir.

Örneğin:

Ali "Landing Page" görevini tamamladı.

Mehmet ABC Ltd. müşterisine not ekledi.

Sabri Mesajify projesine yeni görev ekledi.

Aktiviteler tarih/saat sırasıyla gösterilsin.

---

# 7. İŞLER / GÖREV YÖNETİMİ

Bu ekran uygulamanın en önemli bölümlerinden biridir.

Görevlerin iki görünümü olsun:

Kanban
Liste

Kullanıcı görünümü değiştirebilsin.

## KANBAN

Trello benzeri drag & drop Kanban oluştur.

Varsayılan kolonlar:

Yapılacak
Devam Ediyor
Kontrol
Tamamlandı

Görev kartları kolonlar arasında sürüklenebilsin.

Sürükleme sonucunda durum Supabase'e kaydedilsin.

## GÖREV ALANLARI

Her görevde:

Başlık
Açıklama
Durum
Öncelik
Başlangıç tarihi
Son tarih
Proje
Müşteri
Etiketler
Checklist
Dosyalar
Yorumlar
Oluşturan kullanıcı
Oluşturulma tarihi

bulunabilir.

## ÇOKLU KULLANICI ATAMA

Bir göreve bir veya birden fazla ekip üyesi atanabilmelidir.

Task tablosuna doğrudan tek bir user_id koyma.

Many-to-many ilişki kullan.

Örneğin:

tasks
task_assignees
profiles

task_assignees:

id
task_id
profile_id
created_at

şeklinde olabilir.

Görev oluştururken multi-select kullanıcı seçici kullan.

Görev kartında atanmış kullanıcıların avatarlarını göster.

Avatar yoksa kullanıcının ad/soyad baş harflerini göster.

## ÖNCELİKLER

Düşük
Normal
Yüksek
Acil

## GÖREV DETAYI

Göreve tıklandığında modal veya drawer üzerinden detay ekranı açılabilir.

Buradan:

açıklama
kişiler
proje
müşteri
tarih
öncelik
etiket
checklist
yorum
dosya

yönetilebilsin.

Checklist örneği:

[✓] Tasarım hazırla
[✓] Metin hazırla
[ ] Mobil kontrol
[ ] Production deploy

Checklist ilerlemesi:

2 / 4

şeklinde gösterilebilir.

## YORUMLAR

Göreve ekip üyeleri yorum yazabilsin.

Yorumda:

Kullanıcı
Avatar
Mesaj
Tarih/Saat

göster.

## FİLTRELER

Görevler:

* Bana Atananlar
* Kullanıcı
* Proje
* Müşteri
* Durum
* Öncelik
* Etiket
* Tarih

ile filtrelenebilsin.

Arama alanı da ekle.

---

# 8. PROJELER

Birden fazla SaaS ve şirket projesini buradan yönetmek istiyoruz.

Örneğin:

Mesajify
Test Fest
Hair Clinics

Proje alanları:

* Proje adı
* Açıklama
* Logo
* Renk
* Durum
* Başlangıç tarihi
* Proje yöneticisi
* Ekip üyeleri
* Oluşturulma tarihi

Durumlar:

Planlama
Aktif
Geliştirme
Test
Beklemede
Tamamlandı
Arşiv

Proje kartında:

Proje adı
Durum
Ekip üyeleri
Müşteri sayısı
Açık görev sayısı

gösterilebilir.

## PROJE DETAYI

Proje detayında sekmeler:

Genel Bakış
Görevler
Müşteriler
Notlar
Dosyalar

olsun.

Projeye birden fazla ekip üyesi eklenebilir.

Bunun için project_members gibi many-to-many tablo kullan.

---

# 9. MÜŞTERİLER

Bu bölüm hafif CRM görevi görecek.

Ağır CRM yapma.

Müşteri alanları:

Firma adı
Yetkili kişi
Telefon
E-mail
Adres
Web sitesi
Sorumlu ekip üyesi
Durum
Not
Oluşturulma tarihi

## MÜŞTERİ ETİKETLERİ

Müşterilere birden fazla etiket eklenebilsin.

Örneğin:

VIP
KOBİ
Kurumsal
Esnaf
Yeni
Referans
Riskli

Etiketler kullanıcı tarafından oluşturulabilir olsun.

Bir müşteriye birden fazla etiket atanabilsin.

customer_tags ve tags gibi many-to-many yapı kullan.

## MÜŞTERİ - PROJE İLİŞKİSİ

ÇOK ÖNEMLİ:

Bir müşteri birden fazla projeye bağlı olabilir.

Bir proje de birden fazla müşteriye sahip olabilir.

Many-to-many ilişki kullan.

Örneğin:

customers
projects
customer_projects

customer_projects:

id
customer_id
project_id
created_at

Müşteri detayında bağlı olduğu bütün projeleri göster.

## MÜŞTERİ DETAYI

Müşteri detayında:

Genel Bilgiler
Projeler
Abonelikler
Notlar
Görevler
Dosyalar
Aktiviteler

görülebilsin.

Müşteriye birden fazla not eklenebilsin.

Not üzerinde:

Notu yazan kullanıcı
Not
Tarih/Saat

bulunsun.

---

# 10. ABONELİKLER

Biz SaaS ürünlerimizi aylık abonelik modeliyle müşterilere satıyoruz.

Bu nedenle basit abonelik takip sistemi oluştur.

Ancak muhasebe yazılımına dönüştürme.

Alanlar:

Müşteri
Proje/Ürün
Paket adı
Aylık ücret
Para birimi
Başlangıç tarihi
Sonraki yenileme tarihi
Durum
Not

Durum:

Deneme
Aktif
Ödeme Bekliyor
Donduruldu
İptal

Müşteri + proje üzerinden abonelik ilişkisi kurulabilsin.

Dashboard üzerinde ileride MRR hesaplayabilmek için veri modeli buna uygun olsun.

Aktif aboneliklerin aylık ücretlerinin toplamından MRR hesaplanabilsin.

Farklı para birimleri varsa doğrudan birbirine toplama; para birimine göre ayrı toplam göster.

---

# 11. EKİP

Ekip üyelerini listele.

Kartlarda:

Avatar
Ad Soyad
Rol
Pozisyon
Dahil olduğu projeler
Açık görev sayısı
Geciken görev sayısı

gösterilebilir.

Kullanıcı detayına girildiğinde:

Profil
Projeler
Açık Görevler
Tamamlanan Görevler
Geciken Görevler

görülebilsin.

---

# 12. DOSYALAR

Supabase Storage kullan.

Görev, proje ve müşterilere dosya eklenebilmesi için ortak bir attachment altyapısı oluştur.

Dosyada:

filename
storage_path
mime_type
size
uploaded_by
created_at

tut.

Dosyaların hangi entity'e bağlı olduğunu temiz ve sürdürülebilir şekilde tasarla.

Storage güvenli olmalı.

---

# 13. DATABASE TASARIMI

Supabase PostgreSQL üzerinde normalize edilmiş bir yapı oluştur.

En azından şu entity'leri değerlendir:

profiles
projects
project_members
customers
customer_projects
tags
customer_tags
tasks
task_assignees
task_tags
task_checklists
task_comments
customer_notes
project_notes
subscriptions
goals
attachments
activities

Gerekirse daha doğru bir database tasarımı için tablo ekleyebilirsin.

Foreign key kullan.

Uygun alanlarda:

created_at
updated_at
created_by

kullan.

Silme işlemlerinde ilişkileri düşün.

Database tasarımında özellikle many-to-many ilişkileri doğru kur.

---

# 14. SUPABASE RLS

Supabase Row Level Security kullan.

Frontend'deki kontrolleri güvenlik olarak kabul etme.

Yetkilendirmeyi mümkün olduğunca database/RLS seviyesinde uygula.

Admin tüm verilere erişebilir.

Normal ekip üyesi kendi erişebildiği proje ve ilgili verileri görebilir.

Freelancer yalnızca erişim verilen projeler ve kendisine atanmış işler üzerinden sınırlandırılabilsin.

RLS policy'leri anlaşılır şekilde oluştur.

---

# 15. AKTİVİTE SİSTEMİ

Önemli işlemleri activities tablosuna yaz.

Örneğin:

task_created
task_completed
task_assigned
customer_created
customer_note_added
project_created
subscription_created

Activity kaydında mümkün olduğunca:

user
action
entity_type
entity_id
metadata
created_at

tut.

Dashboard son aktiviteleri buradan okuyabilir.

---

# 16. RESPONSIVE DAVRANIŞ

Bu konu önemlidir.

Mobil kullanım masaüstünün küçültülmüş hali olmamalı.

Mobilde:

Sidebar drawer olsun.

Kanban yatay scroll ile kullanılabilir.

Tablolar gerektiğinde kart/list görünümüne dönüşsün.

Modal'lar küçük ekranlarda full-screen drawer/sheet şeklinde açılabilir.

Formlar tek kolona geçsin.

Butonların dokunmatik alanları yeterince büyük olsun.

Dashboard kartları responsive grid kullansın.

Avatar grupları küçük ekranlarda düzgün görünmeli.

---

# 17. COMPONENT YAPISI

Tekrar kullanılabilir componentler oluştur.

Örneğin:

AppSidebar
AppHeader
PageHeader
StatCard
GoalCard
ProgressBar
TaskCard
TaskModal
TaskForm
UserAvatar
AvatarGroup
UserMultiSelect
ProjectSelect
CustomerSelect
TagSelect
PriorityBadge
StatusBadge
ConfirmDialog
EmptyState
LoadingSkeleton
SearchInput
FilterBar
FileUploader

gibi componentler kullanılabilir.

Ancak sırf component oluşturmak için gereksiz abstraction yapma.

---

# 18. UX DETAYLARI

Formlarda validation yap.

Kaydetme sırasında loading göster.

Double submit engelle.

Başarılı işlemlerde toast göster.

Hataları kullanıcıya anlaşılır Türkçe mesajlarla göster.

Uzun sorgularda loading skeleton kullan.

Boş listelerde sadece boş ekran gösterme.

Örneğin:

"Henüz proje bulunmuyor."

altında:

"İlk Projeni Oluştur"

CTA'sı göster.

Tüm tarihleri kullanıcıya Türkçe formatta göster.

Örneğin:

27 Eyl 2026

Görevin son tarihi geçmiş ve görev tamamlanmamışsa otomatik olarak gecikmiş kabul et.

Örneğin:

"3 gün gecikti"

göster.

---

# 19. KOD KALİTESİ

TypeScript KULLANMA.

JavaScript kullan.

Kod içerisinde gereksiz tekrar oluşturma.

Supabase sorgularını her component içine rastgele dağıtma.

Mantıklı service/helper yapıları kullan.

Environment variable kullan.

Supabase secret/service role key kesinlikle client-side kod içerisine koyma.

Kod okunabilir ve geliştirilebilir olsun.

Desktop ve mobile responsive davranışlarını birlikte geliştir.

---

# 20. ÖNEMLİ İŞ KURALLARI

Aşağıdaki maddeleri özellikle gözden kaçırma:

1. Signup YOK.
2. Login username + password ile yapılacak.
3. Username otomatik olarak [username@ekip.com](mailto:username@ekip.com) formatına çevrilecek.
4. Supabase Auth kullanılacak.
5. TypeScript kullanılmayacak.
6. Tailwind CSS kullanılacak.
7. Supabase PostgreSQL kullanılacak.
8. Supabase Storage kullanılacak.
9. Bir göreve BİRDEN FAZLA kullanıcı atanabilecek.
10. task_assignees many-to-many ilişkisi kullanılacak.
11. Görev kartlarında atanmış kullanıcıların avatarları gösterilecek.
12. Dashboard geciken görevlerde atanmış kişilerin adları/avatarları gösterilecek.
13. Bir müşteri BİRDEN FAZLA projeye bağlanabilecek.
14. Müşterilere BİRDEN FAZLA etiket atanabilecek.
15. Bir projeye BİRDEN FAZLA ekip üyesi bağlanabilecek.
16. Hedefler dashboard üzerinde bütün ekip tarafından takip edilebilecek.
17. Uygulama tamamen responsive olacak.
18. Mobil görünüm ayrıca düşünülerek geliştirilecek.
19. Yetkilendirmede RLS kullanılacak.
20. UI dili Türkçe olacak.

---

# 21. GELİŞTİRME YÖNTEMİ

Projeyi tek seferde kontrolsüz şekilde kodlamaya çalışma.

Önce mevcut Next.js projesinin dosya yapısını ve kullanılan paketleri incele.

Var olan yapıyı gereksiz yere bozma.

Ardından şu sırayla ilerle:

1. Proje yapısını analiz et.
2. Gerekli dependency'leri belirle.
3. Supabase bağlantısını oluştur.
4. Database şemasını tasarla.
5. SQL migration/schema dosyasını hazırla.
6. RLS policy'lerini oluştur.
7. Authentication sistemini oluştur.
8. Ana layout ve responsive sidebar/header oluştur.
9. Dashboard'u oluştur.
10. Görev ve Kanban sistemini oluştur.
11. Projeler modülünü oluştur.
12. Müşteriler modülünü oluştur.
13. Abonelik sistemini oluştur.
14. Ekip ekranını oluştur.
15. Storage/dosya yükleme sistemini oluştur.
16. Activity sistemini bağla.
17. Responsive kontrolleri yap.
18. Loading/error/empty state kontrollerini yap.
19. Kod tekrarlarını ve hataları kontrol et.

Her aşamada mevcut çalışan özellikleri bozmadığından emin ol.

Database tablolarını frontend varsayımlarına göre rastgele oluşturma. Önce ilişkileri doğru tasarla, ardından frontend'i bu veri modelinin üzerine kur.

Uygulamanın temel amacı şudur:

"4-10 kişilik bir SaaS ekibinin projelerini, görevlerini, müşterilerini, aboneliklerini ve şirket hedeflerini mümkün olduğunca sade bir panel üzerinden yönetebilmesi."

Trello, ağır CRM, ERP ve muhasebe yazılımının bütün özelliklerini bir araya getirmeye çalışma.

Basitlik, hız ve kullanılabilirlik öncelikli olsun.

Şimdi önce mevcut projeyi analiz et. Ardından önerdiğin klasör yapısını, kurulması gereken paketleri ve Supabase database mimarisini belirle. Sonrasında implementasyona aşamalı olarak başla.
