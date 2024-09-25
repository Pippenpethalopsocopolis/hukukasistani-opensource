const emailinput = document.getElementById('emailinput');
const phoneInput = document.getElementById('phoneInput');
const emailExistsWarning = document.getElementById('emailExistsWarning');
const phoneExistsWarning = document.getElementById('phoneExistsWarning');
const dateofbirthLengthWarning = document.getElementById('dateofbirthLengthWarning');
const dobIDinput = document.getElementById('dobIDinput');
const phoneNumberLengthWarning = document.getElementById('phoneNumberLengthWarning');

function register(){
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('emailinput').value;
    const phoneNumber = document.getElementById('phoneInput').value;
    const password = document.getElementById('sifreinput').value;
    const dateofbirth = document.getElementById('dobIDinput').value;
    const genderradiobutton = document.getElementsByName('gender');

    let gender;
    for (let i = 0; i < genderradiobutton.length; i++) {
        if (genderradiobutton[i].checked) {
            // save the selected value into a variable
            gender = genderradiobutton[i].value;
            console.log(gender);
            break; // Exit the loop since we found the selected one
        }
    };

    const data = {
        name,
        surname,
        email,
        phoneNumber,
        password,
        dateofbirth,
        gender
    };

    fetch('https://hukukasistani.com/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then((response) => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then((result) => {
        if (result.phoneNumberLengthCheck === "failed" && result.dateofbirthLengthCheck === "failed" && result.emailCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneNumberLengthWarning.style.marginBottom = '0px';
            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.dateofbirthLengthCheck === "failed" && result.emailCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.phoneNumberLengthCheck === "failed" && result.emailCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneNumberLengthWarning.style.marginBottom = '0px';
            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            dateofbirthLengthWarning.style.display = 'none';
            dobIDinput.style.marginBottom = '20px';
        }
        else if (result.phoneNumberLengthCheck === "failed" && result.dateofbirthLengthCheck === "failed" && result.emailCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.phoneNumberLengthCheck === "failed" && result.dateofbirthLengthCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'none';
            emailinput.style.marginBottom = '20px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.phoneNumberLengthCheck === "failed" && result.dateofbirthLengthCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'none';
            emailinput.style.marginBottom = '20px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.phoneNumberLengthCheck === "failed" && result.emailCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            dateofbirthLengthWarning.style.display = 'none';
            dobIDinput.style.marginBottom = '20px';
        }
        else if (result.phoneNumberLengthCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneNumberLengthWarning.style.marginBottom = '0px';
            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'none';
            emailinput.style.marginBottom = '20px';

            dateofbirthLengthWarning.style.display = 'none';
            dobIDinput.style.marginBottom = '20px';
        }
        else if (result.dateofbirthLengthCheck === "failed" && result.emailCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '20px';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.dateofbirthLengthCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'none';
            emailinput.style.marginBottom = '20px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.emailCheck === "failed" && result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            dateofbirthLengthWarning.style.display = 'none';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';
        }
        else if(result.dateofbirthLengthCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '20px';

            emailExistsWarning.style.display = 'none';
            emailinput.style.marginBottom = '20px';

            dateofbirthLengthWarning.style.display = 'flex';
            dobIDinput.style.marginBottom = '0px';
        }
        else if (result.phoneNumberLengthCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'flex';
            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '0px';

            emailExistsWarning.style.display = 'none';
            emailinput.style.marginBottom = '20px';

            dateofbirthLengthWarning.style.display = 'none';
            dobIDinput.style.marginBottom = '20px';
        }
        else if (result.emailCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            dateofbirthLengthWarning.style.display = 'none';

            emailExistsWarning.style.display = 'flex';
            emailinput.style.marginBottom = '0px';

            phoneExistsWarning.style.display = 'none';
            phoneInput.style.marginBottom = '20px';
        }
        else if (result.phoneCheck === "failed"){
            phoneNumberLengthWarning.style.display = 'none';
            dateofbirthLengthWarning.style.display = 'none';

            phoneExistsWarning.style.display = 'flex';
            phoneInput.style.marginBottom = '0px';

            emailinput.style.marginBottom = '20px';
            emailExistsWarning.style.display = 'none';
        }
        else{
            window.location.href = 'https://hukukasistani.com/verification';
        }
    })
}

const gizlilikveCerezSpan = document.getElementById('gizlilikveCerezSpan');
gizlilikveCerezSpan.addEventListener('click', () => {
    window.open('https://hukukasistani.com/gizlilik-ve-cerez', '_blank');
});