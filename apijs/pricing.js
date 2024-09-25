const dummy = 'dummy';
fetch('https://hukukasistani.com/pricing', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({dummy})
})
.then(response => {
    console.log('Response Status:', response.status);
    return response.json();
})
.then(result => {
    const loggedIn = result.loggedIn;
    if (loggedIn === true){
        const loginButton = document.getElementById('login');
        const registerButton = document.getElementById('register');
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
    }
})

const imageOne = document.getElementById('imageOne');
const imageTwo = document.getElementById('imageTwo');
const imageThree = document.getElementById('imageThree');

const cardBoxOne = document.getElementById('cardBoxOne');
const cardBoxTwo = document.getElementById('cardBoxTwo');
const cardBoxThree = document.getElementById('cardBoxThree');

const discountSixMonth = document.getElementById('discountSixMonth');
const discountOneYear = document.getElementById('discountOneYear');

// Function to create hover effect for images and cardboxes at the same time
function addHoverEffect(hoveredElementID, effectedElementID, hoveredElementIDTwo, effectedElementIDTwo){
    hoveredElementID.addEventListener('mouseover', () => {
        effectedElementID.style.boxShadow = "0 0 15px rgb(75, 27, 202)";
    });

    hoveredElementID.addEventListener('mouseover', () => {
        hoveredElementID.style.boxShadow = "0 0 15px rgb(75, 27, 202)";
    });

    hoveredElementIDTwo.addEventListener('mouseover', () => {
        effectedElementIDTwo.style.boxShadow = "0 0 15px rgb(75, 27, 202)";
    });

    hoveredElementIDTwo.addEventListener('mouseover', () => {
        hoveredElementIDTwo.style.boxShadow = "0 0 15px rgb(75, 27, 202)";
    });
}

// Function to remove hover effect for images and cardboxes at the same time
function removeHoverEffect(hoveredElementID, effectedElementID, hoveredElementIDTwo, effectedElementIDTwo){
    hoveredElementID.addEventListener('mouseout', () => {
        effectedElementID.style.boxShadow = "none";
    });

    hoveredElementID.addEventListener('mouseout', () => {
        hoveredElementID.style.boxShadow = "none";
    });

    hoveredElementIDTwo.addEventListener('mouseout', () => {
        effectedElementIDTwo.style.boxShadow = "none";
    });

    hoveredElementIDTwo.addEventListener('mouseout', () => {
        hoveredElementIDTwo.style.boxShadow = "none";
    });
}

function addTextHoverEffect(hoveredElementID, effectedElementID, hoveredElementIDTwo, effectedElementIDTwo){
    hoveredElementID.addEventListener('mouseover', () => {
        effectedElementID.style.textShadow = "0 0 15px rgba(75, 27, 202, 1)";
    });

    hoveredElementID.addEventListener('mouseover', () => {
        hoveredElementID.style.textShadow = "0 0 15px rgba(75, 27, 202, 1)";
    });

    hoveredElementIDTwo.addEventListener('mouseover', () => {
        effectedElementIDTwo.style.textShadow = "0 0 15px rgba(75, 27, 202, 1)";
    });

    hoveredElementIDTwo.addEventListener('mouseover', () => {
        hoveredElementIDTwo.style.textShadow = "0 0 15px rgba(75, 27, 202, 1)";
    });
}

function removeTextHoverEffect(hoveredElementID, effectedElementID, hoveredElementIDTwo, effectedElementIDTwo){
    hoveredElementID.addEventListener('mouseout', () => {
        effectedElementID.style.textShadow = "none";
    });

    hoveredElementID.addEventListener('mouseout', () => {
        hoveredElementID.style.textShadow = "none";
    });

    hoveredElementIDTwo.addEventListener('mouseout', () => {
        effectedElementIDTwo.style.textShadow = "none";
    });

    hoveredElementIDTwo.addEventListener('mouseout', () => {
        hoveredElementIDTwo.style.textShadow = "none";
    });
}

addHoverEffect(imageOne, cardBoxOne, cardBoxOne, imageOne);
removeHoverEffect(imageOne, cardBoxOne, cardBoxOne, imageOne);

addHoverEffect(imageTwo, cardBoxTwo, cardBoxTwo, imageTwo);
removeHoverEffect(imageTwo, cardBoxTwo, cardBoxTwo, imageTwo);

addHoverEffect(imageThree, cardBoxThree, cardBoxThree, imageThree);
removeHoverEffect(imageThree, cardBoxThree, cardBoxThree, imageThree);

addTextHoverEffect(imageTwo, discountSixMonth, cardBoxTwo, discountSixMonth);
removeTextHoverEffect(imageTwo, discountSixMonth, cardBoxTwo, discountSixMonth);

addTextHoverEffect(imageThree, discountOneYear, cardBoxThree, discountOneYear);
removeTextHoverEffect(imageThree, discountOneYear, cardBoxThree, discountOneYear);

// Satın alma tuşuna basınca çıkan popup

cardBoxOne.addEventListener('click', () => {
    const dummy2 = "dummy2";
    fetch('https://hukukasistani.com/pricing', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({dummy2})
    })
    .then(response => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then(result => {
        const activity = result.activity;
        if (activity === "ACTIVE"){
            const activityOverlay = document.createElement('div');
            activityOverlay.id = "activityOverlay";
            document.body.appendChild(activityOverlay);

            const activityOverlayWarningCard = document.createElement('div');
            activityOverlayWarningCard.id = "activityOverlayWarningCard";
            activityOverlayWarningCard.textContent = "Zaten aboneliğiniz bulunmakta. Aboneliğiniz sonra erdikten sonra dilediğiniz paketimizden üyeliğinizi yenileyebilirsiniz. Profil sayfasından aboneliğinizin bitimine kaç gün kaldığını öğrenebilirsiniz.";
            activityOverlay.appendChild(activityOverlayWarningCard);

            activityOverlayWarningCard.addEventListener('click', function(event){
                event.stopPropagation();
            })

            activityOverlay.addEventListener('click', () => {
                activityOverlay.style.display = 'none';
            })
        }
        else{
            const overlay = document.createElement('div');
            overlay.id = 'overlay';
            document.body.appendChild(overlay);

            const cardChoserMainContainer = document.createElement('div');
            cardChoserMainContainer.id = 'cardChoserMainContainer';
            overlay.appendChild(cardChoserMainContainer);

            const note = document.createElement('p');
            note.id = 'note';
            note.textContent = "Banka kartı seçerseniz yalnızca bir aylık ödeme yaparsınız ve bir daha ücret kesilmez. Ancak kredi kartı ile ödemeyi seçerseniz, ödemeleriniz siz iptal edene kadar her ay otomatik tekrarlanır. İptal etme işlemi basittir, yalnızca tek tıkla profil sayfasından iptal edebilirsiniz.";
            cardChoserMainContainer.appendChild(note);

            const creditCardContainer = document.createElement('div');
            creditCardContainer.id = 'creditCardContainer';
            cardChoserMainContainer.appendChild(creditCardContainer);

            const creditCardText = document.createElement('p');
            creditCardText.id = 'creditCardText';
            creditCardText.textContent = "Kredi Kartı";
            creditCardContainer.appendChild(creditCardText);

            const bankCardContainer = document.createElement('div');
            bankCardContainer.id = 'bankCardContainer';
            cardChoserMainContainer.appendChild(bankCardContainer);

            const bankCardText = document.createElement('p');
            bankCardText.id = 'bankCardText';
            bankCardText.textContent = "Banka Kartı";
            bankCardContainer.appendChild(bankCardText);

            cardChoserMainContainer.addEventListener('click', function(event){
                event.stopPropagation();
            })

            if (overlay){
                overlay.addEventListener('click', () => {
                    overlay.style.display = 'none';
                })
            }
        
            creditCardContainer.addEventListener('click', () => {
                const choice = "credit";
                fetch('https://hukukasistani.com/pricing', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({choice})
                })
                .then(response => {
                    console.log('Response Status:', response.status);
                    return response.json();
                })
                .then(result => {
                    window.location.href = 'https://hukukasistani.com/payment';
                })
            
            })
        
            bankCardContainer.addEventListener('click', () => {
                const choice = "bank";
                fetch('https://hukukasistani.com/pricing', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({choice})
                })
                .then(response => {
                    console.log('Response Status:', response.status);
                    return response.json();
                })
                .then(result => {
                    window.location.href = 'https://hukukasistani.com/payment';
                })
            })
        }
    });
})

cardBoxTwo.addEventListener('click',() => {
    const sixMonthPayment = true;
    fetch('https://hukukasistani.com/pricing', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({sixMonthPayment})
        })
        .then(response => {
            console.log('Response Status:', response.status);
            return response.json();
        })
        .then(result => {
            const activity = result.activity;
            if (activity === "ACTIVE"){
                const activityOverlay = document.createElement('div');
                activityOverlay.id = "activityOverlay";
                document.body.appendChild(activityOverlay);

                const activityOverlayWarningCard = document.createElement('div');
                activityOverlayWarningCard.id = "activityOverlayWarningCard";
                activityOverlayWarningCard.textContent = "Zaten aboneliğiniz bulunmakta. Aboneliğiniz sonra erdikten sonra dilediğiniz paketimizden üyeliğinizi yenileyebilirsiniz. Profil sayfasından aboneliğinizin bitimine kaç gün kaldığını öğrenebilirsiniz.";
                activityOverlay.appendChild(activityOverlayWarningCard);

                activityOverlayWarningCard.addEventListener('click', function(event){
                    event.stopPropagation();
                })

                activityOverlay.addEventListener('click', () => {
                    activityOverlay.style.display = 'none';
                })
            }
            else{
                window.location.href = 'https://hukukasistani.com/payment';
            }
        })
});

cardBoxThree.addEventListener('click',() => {
    const oneYearPayment = true;
    fetch('https://hukukasistani.com/pricing', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({oneYearPayment})
        })
        .then(response => {
            console.log('Response Status:', response.status);
            return response.json();
        })
        .then(result => {
            const activity = result.activity;
            if (activity === "ACTIVE"){
                const activityOverlay = document.createElement('div');
                activityOverlay.id = "activityOverlay";
                document.body.appendChild(activityOverlay);

                const activityOverlayWarningCard = document.createElement('div');
                activityOverlayWarningCard.id = "activityOverlayWarningCard";
                activityOverlayWarningCard.textContent = "Zaten aboneliğiniz bulunmakta. Aboneliğiniz sonra erdikten sonra dilediğiniz paketimizden üyeliğinizi yenileyebilirsiniz. Profil sayfasından aboneliğinizin bitimine kaç gün kaldığını öğrenebilirsiniz.";
                activityOverlay.appendChild(activityOverlayWarningCard);

                activityOverlayWarningCard.addEventListener('click', function(event){
                    event.stopPropagation();
                })

                activityOverlay.addEventListener('click', () => {
                    activityOverlay.style.display = 'none';
                })
            }
            else{
                window.location.href = 'https://hukukasistani.com/payment';
            }
        })
});