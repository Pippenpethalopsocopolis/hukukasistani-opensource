function emailVerification(){
    const verificationInput = document.getElementById('verificationInput').value;
    const phoneVerificationInput = document.getElementById('phoneVerificationInput').value;

    fetch('https://hukukasistani.com/verification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            verificationInput,
            phoneVerificationInput
        })
    })
    .then((response) => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then((result) => {
        const verification = result.verification;
        const phoneVerification = result.phoneVerification;
        const mailVerification = result.mailVerification;

        if(verification == "success"){
            console.log('Algilandi.');
            const wrongCode = document.getElementById('wrongCode')
            if (wrongCode != null){
                wrongCode.style.display = 'none';
            }

            const isVerified = document.createElement('p');
            isVerified.setAttribute('id', 'isVerified');
            isVerified.innerHTML = "Başarıyla kayıt oldunuz! Kayıt olurken verdiğiniz bilgiler kesinlikle üçüncü parti kurumlar ve şahıslar ile <b>paylaşılmamaktadır</b>. Gizlilik konusunda Türkiye Cumhuriyeti kanunları ve Avrupa Birliği gizlilik standartlarına göre hareket etmeyi Yapay Zeka Hukuk olarak <b>prensip</b> edinmekteyiz.";

            const toLogin = document.createElement('p');
            toLogin.setAttribute('id', 'toLogin');
            toLogin.textContent = "Giriş Yap";

            const verificationForm = document.getElementById('verificationForm');
            verificationForm.appendChild(isVerified);
            verificationForm.appendChild(toLogin);

            toLogin.addEventListener('click', () => {
                window.location.href = 'https://hukukasistani.com/login';
            });
        }
        else if(mailVerification == "failed" && phoneVerification == "failed"){
            const failCounter = result.failCounter;
            if(failCounter == 1){
                const wrongCode = document.createElement('p');
                wrongCode.setAttribute('id', 'wrongCode');
                wrongCode.textContent = "E-Mailinize ve telefonunuza gelen doğrulama kodlarının ikisini de yanlış girdiniz. 2 hakkınız kaldı.";

                const verificationForm = document.getElementById('verificationForm');
                verificationForm.appendChild(wrongCode);
            }
            else if (failCounter == 2){
                const wrongCode = document.getElementById('wrongCode');
                wrongCode.innerHTML = "E-Mailinize ve telefonunuza gelen doğrulama kodlarının ikisini de yanlış girdiniz. 1 hakkınız kaldı."
            }
            else if (failCounter == 3){
                window.location.href = 'https://hukukasistani.com/register';
            }
            else{
                window.location.href = 'https://hukukasistani.com/register';
            }
        }
        else if (mailVerification == "failed"){
            const failCounter = result.failCounter;
            if(failCounter == 1){
                const wrongCode = document.createElement('p');
                wrongCode.setAttribute('id', 'wrongCode');
                wrongCode.textContent = "E-Mailinize gelen doğrulama kodunu yanlış girdiniz. 2 hakkınız kaldı.";

                const verificationForm = document.getElementById('verificationForm');
                verificationForm.appendChild(wrongCode);
            }
            else if (failCounter == 2){
                const wrongCode = document.getElementById('wrongCode');
                wrongCode.textContent = "E-Mailinize gelen doğrulama kodunu yanlış girdiniz. 1 hakkınız kaldı."
            }
            else if (failCounter == 3){
                window.location.href = 'https://hukukasistani.com/register';
            }
            else{
                window.location.href = 'https://hukukasistani.com/register';
            }
        }
        else if (phoneVerification == "failed"){
            const failCounter = result.failCounter;
            if(failCounter == 1){
                const wrongCode = document.createElement('p');
                wrongCode.setAttribute('id', 'wrongCode');
                wrongCode.textContent = "Telefonunuza gelen doğrulama kodunu yanlış girdiniz. 2 hakkınız kaldı.";

                const verificationForm = document.getElementById('verificationForm');
                verificationForm.appendChild(wrongCode);
            }
            else if (failCounter == 2){
                const wrongCode = document.getElementById('wrongCode');
                wrongCode.textContent = "Telefonunuza gelen doğrulama kodunu yanlış girdiniz. 1 hakkınız kaldı."
            }
            else if (failCounter == 3){
                window.location.href = 'https://hukukasistani.com/register';
            }
            else{
                window.location.href = 'https://hukukasistani.com/register';
            }
        }
        else{
            const wrongCode = document.createElement('p');
            wrongCode.setAttribute('id', 'wrongCode');
            wrongCode.textContent = "Kaydolma formunda yanlış doldurduğunuz bilgiler sebebiyle üyeliğiniz yapılamamıştır. Lütfen tekrar deneyiniz.";

            const toLogin = document.createElement('p');
            toLogin.setAttribute('id', 'toLogin');
            toLogin.textContent = "Geri Dön";
            toLogin.addEventListener('click', () => {
                window.location.href = 'https://hukukasistani.com/register';
            });

            const verificationForm = document.getElementById('verificationForm');
            verificationForm.appendChild(wrongCode);
            verificationForm.appendChild(toLogin);
        }
    })
}