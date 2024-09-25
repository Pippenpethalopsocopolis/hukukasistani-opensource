function login(){
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const data = {
            email,
            password
        }

        fetch('https://hukukasistani.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Response Status:', response.status);
            return response.json();
        })
        .then(result => {
            sessionStorage.setItem('authentication', result.authentication);
            console.log("Giris Basarisi: " + result.authentication);

            if(result.authentication == "success"){
                window.location.href = 'https://hukukasistani.com/profile';
            }
            else{
                const wrongEmailorPasswordCheck = document.getElementById('wrongEmailorPassword');
                if (wrongEmailorPasswordCheck === null){
                    const wrongEmailorPassword = document.createElement('p');
                    wrongEmailorPassword.id = 'wrongEmailorPassword';
                    wrongEmailorPassword.textContent = "E-Posta adresiniz veya şifreniz yanlış. Lütfen tekrar deneyin.";

                    const loginform = document.getElementById('loginform');
                    loginform.appendChild(wrongEmailorPassword);
                }
                else{
                    wrongEmailorPasswordCheck.textContent = 'E-Posta adresiniz veya şifreniz yanlış. Lütfen tekrar deneyin.';
                }
            }
        })

    } catch (error) {
        console.log(error);
    }
}