function forgotPassword(){
    const email = document.getElementById('email').value;
    const sendButton = document.getElementById('sendButton');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    fetch('https://hukukasistani.com/forgotPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email})
    })
    .then(response => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then(result => {
        const emailSended = result.emailSended;
        const requestLimitBreached = result.requestLimitBreached;
        const wrongMail = result.wrongMail;
        if (requestLimitBreached === true){
            const informationAboutEmail = document.getElementById('informationAboutEmail');
            informationAboutEmail?.remove();

            const informationAboutEmail2 = document.getElementById('informationAboutEmail2');
            informationAboutEmail2?.remove();

            const wrongMailWarning = document.getElementById('wrongMailWarning');
            wrongMailWarning?.remove();

            const requestLimitWarning = document.createElement('p');
            requestLimitWarning.id = 'requestLimitWarning';
            requestLimitWarning.textContent = "Çok fazla deneme yaptınız, 10 dakika sonra tekrar deneyiniz.";
            forgotPasswordForm.insertBefore(requestLimitWarning, sendButton);
        }
        else if (wrongMail === true){
            const requestLimitWarning = document.getElementById('requestLimitWarning');
            requestLimitWarning?.remove();

            const informationAboutEmail = document.getElementById('informationAboutEmail');
            informationAboutEmail?.remove();

            const informationAboutEmail2 = document.getElementById('informationAboutEmail2');
            informationAboutEmail2?.remove();

            const wrongMailWarning = document.createElement('p');
            wrongMailWarning.id = 'wrongMailWarning';
            wrongMailWarning.textContent = "Yazdığınız e-posta adresi hatalıdır. Lütfen tekrar deneyiniz.";
            forgotPasswordForm.insertBefore(wrongMailWarning, sendButton);
        }
        else{
            if (emailSended === true){
                const requestLimitWarning = document.getElementById('requestLimitWarning');
                requestLimitWarning?.remove();

                const informationAboutEmail2 = document.getElementById('informationAboutEmail2');
                informationAboutEmail2?.remove();

                const wrongMailWarning = document.getElementById('wrongMailWarning');
                wrongMailWarning?.remove();

                const informationAboutEmail = document.createElement('p');
                informationAboutEmail.id = 'informationAboutEmail';
                informationAboutEmail.textContent = "Şifreniz E-Posta adresinize yollanmıştır. Şifreniz gelmediyse lütfen doğru bir e-posta adresi girdiğinizden emin olun.";

                forgotPasswordForm.appendChild(informationAboutEmail);
            }
            else{
                const requestLimitWarning = document.getElementById('requestLimitWarning');
                requestLimitWarning?.remove();

                const informationAboutEmail = document.getElementById('informationAboutEmail');
                informationAboutEmail?.remove();

                const wrongMailWarning = document.getElementById('wrongMailWarning');
                wrongMailWarning?.remove();

                const informationAboutEmail2 = document.createElement('p');
                informationAboutEmail2.id = 'informationAboutEmail2';
                informationAboutEmail2.textContent = "Bir hata oluştu lütfen tekrar deneyiniz.";

                forgotPasswordForm.appendChild(informationAboutEmail2);
            }
        }
    });
}