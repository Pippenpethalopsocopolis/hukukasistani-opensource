function getPaymentData(){
    const customerName = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const identityNumber = document.getElementById('identityNumber').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const city = document.getElementById('city').value;
    const district = document.getElementById('district').value;
    const country = document.getElementById('country').value;
    const address = document.getElementById('adress').value;

    const paymentText = document.getElementById('paymentText');
    const paymentDataForm = document.getElementById('paymentDataForm');
    paymentDataForm.style.display = 'none';
    paymentText.style.display = 'none';
    
    const forwardtoPaymentForm = document.getElementById('forwardtoPaymentForm');
    forwardtoPaymentForm.style.display = 'flex';

    // Form'a ve Sözleşmeye verileri aktar
    const flagforgettinPaymentDetails = true;

    const aliciAdSoyad = document.getElementById('aliciAdSoyad');
    const aliciAdres = document.getElementById('aliciAdres');
    const aliciTelefon = document.getElementById('aliciTelefon');
    const aliciEposta = document.getElementById('aliciEposta');
    const urunAdi = document.getElementById('urunAdi');
    const urunIcerigi = document.getElementById('urunIcerigi');
    const toplamTutar = document.getElementById('toplamTutar');

    const mesafeliSatisAliciAdSoyad = document.getElementById('mesafeliSatisAliciAdSoyad');
    const mesafeliSatisAliciAdres = document.getElementById('mesafeliSatisAliciAdres');
    const mesafeliSatisAliciAdSoyad2 = document.getElementById('mesafeliSatisAliciAdSoyad2');
    const mesafeliSatisAliciTelefon = document.getElementById('mesafeliSatisAliciTelefon');
    const mesafeliSatisAliciEposta = document.getElementById('mesafeliSatisAliciEposta');
    const mesafeliSatisTeslimEdilecekAdSoyad = document.getElementById('mesafeliSatisTeslimEdilecekAdSoyad');
    const mesafeliSatisTeslimEdilecekAdres = document.getElementById('mesafeliSatisTeslimEdilecekAdres');
    const mesafeliSatisTeslimEdilecekTelefon = document.getElementById('mesafeliSatisTeslimEdilecekTelefon');
    const mesafeliSatisTeslimEdilecekEposta = document.getElementById('mesafeliSatisTeslimEdilecekEposta');
    const price = document.getElementById('price');
    const totalPrice = document.getElementById('totalPrice');
    const paymentMethodandPaymentPlan = document.getElementById('paymentMethodandPaymentPlan');
    const mesafeliSatisTeslimEdilecekKisi = document.getElementById('mesafeliSatisTeslimEdilecekKisi');
    const faturaAdresi = document.getElementById('faturaAdresi');
    const siparisTarihi = document.getElementById('siparisTarihi');
    const faturaAdSoyad = document.getElementById('faturaAdSoyad');
    const faturaAdres = document.getElementById('faturaAdres');
    const faturaTelefon = document.getElementById('faturaTelefon');
    const faturaEposta = document.getElementById('faturaEposta');
    const mesafeliSatisAliciAdSoyad3 = document.getElementById('mesafeliSatisAliciAdSoyad3');
    const tarih = document.getElementById('tarih');
    
    fetch('https://hukukasistani.com/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({flagforgettinPaymentDetails, identityNumber}),
    })
    .then((response) => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then((result) => {
        // Create a new Date object which will contain the current date and time
        const currentDate = new Date();
        // Extract individual components of the date
        const year = currentDate.getFullYear(); // Get the current year
        const month = currentDate.getMonth() + 1; // Get the current month (months are zero-based, so add 1)
        const day = currentDate.getDate(); // Get the current day of the month
        const hours = currentDate.getHours(); // Get the current hour
        const minutes = currentDate.getMinutes(); // Get the current minute
        const seconds = currentDate.getSeconds(); // Get the current second

        const sixMonthPayment = result.sixMonthPayment;
        const cardChoice = result.cardChoice;
        const oneYearPayment = result.oneYearPayment;

        let productName;
        let productContent;
        let productPrice;

        if (cardChoice === "credit"){
            productName = "Hukuk Asistanı 1 Aylık Tekrarlanan Paket";
            productContent = "Her ay boyunca abonelik iptal edilmediği sürece Hukuk Asistanı'na sınırsız erişim. Hukuk Asistanı ile hukuksal konularda bilgi alabilir ve hukuksal dilekçe yazımında yardım alabilir.";
            productPrice = "200";
        }
        else if (cardChoice === "bank"){
            productName = "Hukuk Asistanı 1 Aylık Paket";
            productContent = "Bir ay boyunca Hukuk Asistan'ına sınırsız erişim. Hukuk Asistanı ile hukuksal konularda bilgi alabilir ve hukuksal dilekçe yazımında yardım alabilir.";
            productPrice = "200";
        }
        else if (sixMonthPayment !== undefined || sixMonthPayment !== null){
            productName = "Hukuk Asistanı 6 Aylık Paket";
            productContent = "Altı ay boyunca Hukuk Asistan'ına sınırsız erişim. Hukuk Asistanı ile hukuksal konularda bilgi alabilir ve hukuksal dilekçe yazımında yardım alabilir.";
            productPrice = "1000";
        }
        else if (oneYearPayment !== undefined || oneYearPayment !== null){
            productName = "Hukuk Asistanı 6 Aylık Paket";
            productContent = "Bir yıl boyunca Hukuk Asistan'ına sınırsız erişim. Hukuk Asistanı ile hukuksal konularda bilgi alabilir ve hukuksal dilekçe yazımında yardım alabilir.";
            productPrice = "2000";
        }

        // Aydinlatma Formu
        aliciAdSoyad.textContent = `ALICI Adı Soyadı: ${customerName} ${surname}`;
        aliciAdres.textContent = `Adres: ${address}`;
        aliciTelefon.textContent = `Telefon: ${phoneNumber}`;
        aliciEposta.textContent = `E-Posta: ${email}`;
        urunAdi.textContent = `Ürün Adı: ${productName}`;
        urunIcerigi.textContent = `Ürün İçeriği: ${productContent}`;
        toplamTutar.textContent = `Toplam Tuar: ${productPrice}`;

        // Mesafeli satis sozlesmesi
        mesafeliSatisAliciAdSoyad.textContent = `AD - SOYAD: ${customerName} ${surname}`;
        mesafeliSatisAliciAdres.textContent = `ADRES: ${address}`;
        mesafeliSatisAliciAdSoyad2.textContent = `Teslim edilecek kişi: ${customerName} ${surname}`;
        mesafeliSatisAliciTelefon.textContent = `Telefon: ${phoneNumber}`;
        mesafeliSatisAliciEposta.textContent = `E-Posta/kullanıcı adı: ${email}`;
        mesafeliSatisTeslimEdilecekAdSoyad.textContent = `Ad/Soyad/Unvan: ${customerName} ${surname}`;
        mesafeliSatisTeslimEdilecekAdres.textContent = `Adres: ${address}`;
        mesafeliSatisTeslimEdilecekTelefon.textContent = `Telefon: ${phoneNumber}`;
        mesafeliSatisTeslimEdilecekEposta.textContent = `E-Posta/kullanıcı adı: ${email}`;
        price.textContent = `Birim Fiyatı: ${productPrice}`;
        totalPrice.textContent = `KDV Dahil Toplam Tutar: ${productPrice}`;
        paymentMethodandPaymentPlan.textContent = `Ödeme Şekli ve Planı: Kartla Ödeme, ${productName}`;
        mesafeliSatisTeslimEdilecekKisi.textContent = `Teslim Edilecek kişi: ${customerName} ${surname}`;
        faturaAdresi.textContent = `Fatura Adresi: ${address}`;
        siparisTarihi.textContent = `Sipariş Tarihi: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        faturaAdSoyad.textContent = `Ad/Soyad/Unvan: ${customerName} ${surname}`;
        faturaAdres.textContent = `Adres: ${address}`;
        faturaTelefon.textContent = `Telefon: ${phoneNumber}`;
        faturaEposta.textContent = `E-Posta/kullanıcı adı: ${email}`;
        mesafeliSatisAliciAdSoyad3.textContent = `ALICI: ${customerName} ${surname}`;
        tarih.textContent = `TARİH: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    });
}

const forwardtoPaymentButton = document.getElementById('forwardtoPaymentButton');
forwardtoPaymentButton.addEventListener('click', () => {
    const flagforgettinPaymentDetails = false;

    const forwardtoPaymentForm = document.getElementById('forwardtoPaymentForm');

    const paymentDataForm = document.getElementById('paymentDataForm');
    paymentDataForm.style.display = 'none';

    const paymentText = document.getElementById('paymentText');

    const paymentData = {
        customerName: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        identityNumber: document.getElementById('identityNumber').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        city: document.getElementById('city').value,
        district: document.getElementById('district').value,
        country: document.getElementById('country').value,
        address: document.getElementById('adress').value,
        sozlesmeveFormOnay: document.getElementById('sozlesmeveFormOnay').checked
    }
    
    fetch('https://hukukasistani.com/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData, {flagforgettinPaymentDetails}),
    })
    .then((response) => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then((result) => {
        const status = result.status;
        const sozlesveFormOnaylandi = result.sozlesveFormOnaylandi;
        if (status === 'failure'){
            const sozlesmeveFormWarning = document.getElementById('sozlesmeveFormWarning');
            sozlesmeveFormWarning.style.display = 'none';
            forwardtoPaymentForm.style.display = 'none';
            paymentDataForm.style.display = 'flex';
            paymentText.style.display = 'inline-block';
            const unknownErrorCheck = document.getElementById('unknownError');
            if (unknownErrorCheck){
                unknownErrorCheck.style.display = 'none';
            }

            const warning = document.createElement('p');
            warning.id = 'warning';
            warning.innerHTML = "Bilgilerinizi <b>TAM</b> ve <b>DOĞRU</b> giriniz.";
            
            const mainContainer = document.getElementById('mainContainer');
            mainContainer.insertBefore(warning, paymentText);
        }
        else if (status === 'success'){
            let checkoutFormContent = result.checkoutFormContent;
            const iyziScript = document.createElement('script');
            iyziScript.defer = true;
            document.body.appendChild(iyziScript);

            document.write('<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><script src="apijs/paymentsend.js" defer></script><style></style></head><body><div id="iyzipay-checkout-form" class="responsive"></div></body></html>' + checkoutFormContent);
        }
        else if (sozlesveFormOnaylandi === false){
            const sozlesmeveFormWarning = document.getElementById('sozlesmeveFormWarning');
            sozlesmeveFormWarning.style.display = 'block';
        }
        else{
            const sozlesmeveFormWarning = document.getElementById('sozlesmeveFormWarning');
            sozlesmeveFormWarning.style.display = 'none';
            forwardtoPaymentForm.style.display = 'none';
            paymentDataForm.style.display = 'flex';
            paymentText.style.display = 'inline-block';
            const warning = document.getElementById('warning');
            if (warning){
                warning.style.display = 'none';
            }

            const unknownError = document.createElement('p');
            unknownError.id = 'unknownError';
            unknownError.textContent = "Bilinmeyen bir hata meydana geldi lütfen sayfayı yenileyip tekrar deneyiniz."
            
            const mainContainer = document.getElementById('mainContainer');
            mainContainer.insertBefore(unknownError, paymentText);
        }
    })
});

const download = document.getElementById('download');
download.addEventListener('click', () => {
    const flagforgettinPaymentDetails = false;
    const flagforDownloadButton = true;

    const sozlesmeveForm = document.getElementById('sozlesmeveForm').textContent;

    fetch('https://hukukasistani.com/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({flagforDownloadButton, flagforgettinPaymentDetails, sozlesmeveForm})
    })
    .then((response) => {
        console.log('Response Status:', response.status);
        return response.blob();
    })
    .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // Create a temporary URL for the blob
        link.download = 'sozlesme.pdf'; // Set the download filename
        link.click(); // Simulate a click on the link to trigger download
    });
});