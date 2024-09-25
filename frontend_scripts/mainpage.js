document.addEventListener('DOMContentLoaded', function () {
    // Butona basınca aşağa gitmeye yarayan script.
    document.getElementById('scrollButton').addEventListener('click', function () {
        // Use smooth scrolling behavior
        document.querySelector('.target-section').scrollIntoView({ behavior: 'smooth' });
    });
    // Butona basınca aşağa gitmeye yarayan script.

    const sectionTwoButton = document.getElementById('sectionTwoButton');
    sectionTwoButton.addEventListener('click', () => {
        window.location = "https://hukukasistani.com/register";
    })

    const acceptButton = document.getElementById('acceptButton');
    const refuseButton = document.getElementById('refuseButton');
    acceptButton.addEventListener('click', () => {
        const cookieCheckboxValue = true;
        const cookieCheckboxValueTwo = true;
        fetch('https://hukukasistani.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cookieCheckboxValue,
                cookieCheckboxValueTwo
            })
        });
        const cookieBanner = document.getElementById('cookieBanner');
        const cookieBannerOpener = document.getElementById('cookieBannerOpener');
        cookieBannerOpener.style.display = 'flex';
        cookieBanner.style.display = 'none';
    });

    refuseButton.addEventListener('click', () => {
        const cookieCheckboxValue = false;
        const cookieCheckboxValueTwo = false;
        fetch('https://hukukasistani.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cookieCheckboxValue,
                cookieCheckboxValueTwo
            })
        });
        
        const cookieBanner = document.getElementById('cookieBanner');
        const cookieBannerOpener = document.getElementById('cookieBannerOpener');
        cookieBannerOpener.style.display = 'flex';
        cookieBanner.style.display = 'none';

    });

    const cookieSettings = document.getElementById('cookieSettings');
    cookieSettings.addEventListener('click', () => {
        const cookieOverlay = document.createElement('div');
        cookieOverlay.id = 'cookieOverlay';
        document.body.appendChild(cookieOverlay);

        const cookieDetailedSettings = document.createElement('div');
        cookieDetailedSettings.id = 'cookieDetailedSettings';
        cookieOverlay.appendChild(cookieDetailedSettings);

        const yourSettingsButton = document.createElement('button');
        yourSettingsButton.id = 'yourSettingsButton'
        yourSettingsButton.textContent = "Ayarlarınız";
        cookieDetailedSettings.appendChild(yourSettingsButton);

        const aydinlatmaMetniButton = document.createElement('button');
        aydinlatmaMetniButton.id = 'aydinlatmaMetniButton';
        aydinlatmaMetniButton.textContent = "Aydınlatma Metni"
        cookieDetailedSettings.appendChild(aydinlatmaMetniButton);

        const textContainer = document.createElement('p');
        textContainer.id = 'textContainer';
        textContainer.innerHTML = "<span id='fonksiyonelCerezler'>Fonksiyonel Çerezler:</span><br>Sitemizi ziyaret eden kullanıcılarımıza verimli bir şekilde hizmet verebilmek için gerekli çerezlerdir. Sunucu içersindeki sessionlarda işlenir ve kullanıcıya daha iyi bir deneyim vermek için gereklidir. Kapatılırsa sitenin bir kısmı yada tamamı düzgün çalışmayabilir.";
        cookieDetailedSettings.appendChild(textContainer);

        const switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');
        cookieDetailedSettings.appendChild(switchLabel);

        const cookiCheckbox = document.createElement('input');
        cookiCheckbox.id = 'chackboxID';
        cookiCheckbox.classList.add('checkbox');
        cookiCheckbox.type = 'checkbox';
        switchLabel.appendChild(cookiCheckbox);

        const slider = document.createElement('span');
        slider.classList.add('slider');
        switchLabel.appendChild(slider);

        const cookieLine = document.createElement('div');
        cookieLine.id = 'cookieLine';
        cookieDetailedSettings.appendChild(cookieLine);

        const textContainerTwo = document.createElement('p');
        textContainerTwo.id = 'textContainerTwo';
        textContainerTwo.innerHTML = "<span id='fonksiyonelCerezler'>Pazarlama Çerezleri:</span><br>Karşınıza daha uygun ödeme teklifleri çıkartmak için veya sitemizin tasarımsal özelliklerini geliştirmek için aldığımız, sitemiz içersindeki kullanım alışkanlıklarınızı analiz ettiğimiz çerezlerdir.";
        cookieDetailedSettings.appendChild(textContainerTwo);

        const switchLabel2 = document.createElement('label');
        switchLabel2.classList.add('switch');
        cookieDetailedSettings.appendChild(switchLabel2);

        const cookiCheckbox2 = document.createElement('input');
        cookiCheckbox2.id = 'chackboxID';
        cookiCheckbox2.classList.add('checkbox');
        cookiCheckbox2.type = 'checkbox';
        switchLabel2.appendChild(cookiCheckbox2);

        const slider2 = document.createElement('span');
        slider2.classList.add('slider');
        switchLabel2.appendChild(slider2);

        const saveCookies = document.createElement('button');
        saveCookies.id = 'saveCookies';
        saveCookies.style = 'button';
        saveCookies.textContent = 'Kaydet';
        cookieDetailedSettings.appendChild(saveCookies);

        aydinlatmaMetniButton.addEventListener('click', () => {
            switchLabel.style.display = 'none';
            switchLabel2.style.display = 'none';
            textContainer.style.display = 'none';
            textContainerTwo.style.display = 'none';
            cookieLine.style.display = 'none';
            saveCookies.style.display= 'none';

            const aydinlatmaText = document.createElement('p');
            aydinlatmaText.id = 'aydinlatmaText';
            aydinlatmaText.innerHTML = "<span id='aydinlatmaSpan'>Aydınlatma Metni:</span><br>www.hukukasistani.com olarak sitemize üye olan kullanıcılarımızdan ad, soyad, telefon numarası, e-posta adresi ve şifre gibi sizin girmiş olduğunuz bilgileri otomatik olarak alıp, profiliniz oluşturulması için kullanmaktayız. Bunun dışında sitemizin hizmetlerine abone olan kullanıcılarımızdan ise ek olarak aldığımız ad, soyad, telefon numarası, ip adresi, adres gibi bilgileri birlikte çalıştığımız banka gateaway hizmetleriyle paylaşmaktayız. Bu veriler banka, banka gateaway hizmeti ve bizim dışımızda kimse ile paylaşılmamaktadır. Banka ile paylaşılması sebebi ise yasal zorunluluktur. Kişisel verileriniz, yürürlükteki mevzuata ve Kişisel Verilerin Korunması Kanununa uygun olarak aşağıdaki amaçların gerçekleştirilmesi için otomatik olan ya da otomatik olmayan yöntemlerle, KVK Kanunu’nun 5. ve 6. maddelerinde yer alan hükümlere uygun olarak, kanunlarda açıkça öngörülen hallerde, bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması halinde veya ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla ve www.hukukasistani.com sitesinin meşru menfaatleri gereği işlenmektedir. Kişisel verileri işleme amaçları sitemizin politikaları ve mevzuattan kaynaklanan yükümlülüklerimiz doğrultusunda güncellenebilecek olup, özellikle; Hukuki süreçlerin yürütülmesi, pazarlama faaliyetlerinin yürütülmesi, kullanıcı deneyimi kapsamında araştırma faaliyetlerinin yürütülmesi, kullanıcılara daha iyi içerik servisi sunulması amacıyla araştırmalar gerçekleştirilmesi, pazarlama faaliyetleri kapsamında kullanıcı sınıflandırmasının yapılması, pazarlama faaliyetlerinin yürütülmesi adına kullanıcı listesinin oluşturulması, internet sitesi üzerinden üye giriş işlemlerinin yapılması, internet sitesi üzerinden ziyaret işlemlerinin takip edilmesi, internet sitesi çerezlerinin analiz edilmesi ve takibinin yapılması amacıyla işlenmektedir. Kişisel verileriniz, ilgili mevzuatta belirtilen süreler dahilinde veya işleme amacının ortadan kalkması durumunda, derhal veya verinin niteliğine göre makul süre zarfında ve herhalde kanuni zamanaşımı süreleri kadar muhafaza edilecektir.";
            cookieDetailedSettings.appendChild(aydinlatmaText);

            const ekText = document.createElement('p');
            ekText.id = 'ekText';
            const ekText2 = document.createElement('p');
            ekText2.id = 'ekText2';
            ekText.textContent = "Kişisel veri aktarımlarında uygulanacak usul ve esaslar KVK Kanunu’nun 8. ve 9. maddelerinde düzenlenmiş olup, ilgili kişinin kişisel verileri ve özel nitelikli kişisel verileri yurt içinde ve yurt dışında bulunan üçüncü kişilere aktarılabilmektedir. Kullanıcılarımızın sahip olduğu haklar kapsamında, KVK Kanunu’nun 11. maddesi uyarınca, bize başvurarak kişisel verileriniz hakkında aşağıdaki konulara ilişkin taleplerde bulunabilirsiniz: Kişisel verilerinin işlenip işlenmediğini öğrenme, kişisel verileri işlenmişse buna ilişkin bilgi talep etme, Kişisel verilerinin işlenme amacı ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, kişisel verilerinin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme, kişisel verilerinin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, kişisel verilerinin işlenmesini gerektiren sebeplerin ortadan kalkması halinde bunların silinmesini, yok edilmesini veya anonim hale getirilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, işlenen kişisel verilerinin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle veri sahibinin aleyhine bir sonucun ortaya çıkmasına itiraz etme, Kişisel verilerinin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme. Kişisel veri sahipleri olarak, haklarınıza ilişkin taleplerinizi aşağıda düzenlenen yöntemlerle iletmeniz durumunda www.hukukasistani.com talebin niteliğine göre talebi en kısa sürede ve en geç otuz gün içinde sonuçlandıracaktır."
            ekText2.textContent = "Bu kapsamda kişisel veri sahipleri, KVKK madde 11’de sayılan haklarını veri sorumlusu sitemizden talep etme hakkına sahiptir. 11. maddede belirtilen haklarınızı kullanma ile ilgili talebinizi, 6698 sayılı Kanunu’nun 13. maddesinin 1. fıkrası ve 30356 sayılı ve 10.03.2018 tarihli Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ gereğince Türkçe ve yazılı olarak veya kayıtlı elektronik posta (KEP) adresi, güvenli elektronik imza, mobil imza ya da sitemize daha önce bildirilen ve sistemimizde kayıtlı bulunan elektronik posta adresini kullanmak suretiyle iletebilirsiniz. Başvurularda sadece başvuru sahibi kişi hakkında bilgi verilecek olup diğer aile fertleri ve üçüncü kişiler hakkında bilgi alınması mümkün olmayacaktır. Sitemizin cevap vermeden önce kimliğinizi doğrulama hakkı saklıdır. Başvurunuzda; Adınızın, soyadınızın ve başvuru yazılı ise imzanızın, Türkiye Cumhuriyeti vatandaşları için T.C. kimlik numaranızın, yabancı iseniz uyruğunuzun, pasaport numaranızın veya varsa kimlik numaranızın, varsa bildirime esas elektronik posta adresi, telefon ve faks numaranızın, talep konunuzun, bulunması zorunlu olup varsa konuya ilişkin bilgi ve belgelerin de başvuruya eklenmesi gerekmektedir. Sitemize ait destek iletişim mailine bu bilgileri gönderebilirsiniz. Talebinizin niteliğine göre kimlik tespitine olanak sağlayacak bilgi ve belgelerin eksiksiz ve doğru olarak tarafımıza sağlanması gerekmektedir. İstenilen bilgi ve belgelerin gereği gibi sağlanmaması durumunda, sitemiz tarafından talebinize istinaden yapılacak araştırmaların tam ve nitelikli şekilde yürütülmesinde aksaklıklar yaşanabilecektir. Bu durumda, sitemizin kanuni haklarını saklı tuttuğunu beyan eder. Bu nedenle, başvurunuzun talebinizin niteliğine göre eksiksiz ve istenilen bilgileri ve belgeleri içerecek şekilde gönderilmesi gerekmektedir."
            cookieDetailedSettings.appendChild(ekText);
            cookieDetailedSettings.appendChild(ekText2);
        });

        yourSettingsButton.addEventListener('click', () => {
            const aydinlatmaText = document.getElementById('aydinlatmaText');
            const ekText = document.getElementById('ekText');
            const ekText2 = document.getElementById('ekText2');

            aydinlatmaText.remove();
            ekText.remove();
            ekText2.remove();

            switchLabel.style.display = 'block';
            switchLabel2.style.display = 'block';
            textContainer.style.display = 'block';
            textContainerTwo.style.display = 'block';
            cookieLine.style.display = 'block';
            saveCookies.style.display = 'block';
        });

        cookieDetailedSettings.addEventListener('click', function(event){
            event.stopPropagation();
        });

        cookieOverlay.addEventListener('click', () => {
            cookieOverlay.remove();
        });

        const cookieBanner = document.getElementById('cookieBanner');

        saveCookies.addEventListener('click', () => {
            const cookieCheckboxValue = cookiCheckbox.checked;
            const cookieCheckboxValueTwo = cookiCheckbox2.checked;
            fetch('https://hukukasistani.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cookieCheckboxValue,
                    cookieCheckboxValueTwo
                })
            });

            cookieBanner.style.display = 'none';
            cookieOverlay.style.display = 'none';
        });
    });

    const dummy = 'dummy';
    fetch('https://hukukasistani.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            dummy
        })
    })
    .then(response => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then(result => {
        const isLogedIn = result.isLogedIn;
        if (isLogedIn == true){
            const loginButton = document.getElementById('login');
            const registerButton = document.getElementById('register');
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';

            const cookieBanner = document.getElementById('cookieBanner');
            cookieBanner.style.display = 'none';
        }
        else{
            if(result.ipExists === true){
                const cookieBanner = document.getElementById('cookieBanner');
                cookieBanner.style.display = 'none';
        
                const cookieBannerOpener = document.getElementById('cookieBannerOpener');
                cookieBannerOpener.style.display = 'flex';
            }
        }
    });
});