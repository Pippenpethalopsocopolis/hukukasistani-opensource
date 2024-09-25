// Sayfada refresh yapılıp yapılmadığını test eden kodlar

let refreshCounter = 1;
sessionStorage.setItem('refreshCount', refreshCounter);
console.log(`Refresh Count: ` + refreshCounter);

let lastCounter = refreshCounter;

if (refreshCounter === lastCounter) {  
    console.log("Refresh counter is equal to last counter.");
};

// Sayfada refresh yapılıp yapılmadığını test eden kodlar

function fetchHistory(){
    const info = 'success';
    const infoData = {
        info
    };

    fetch('https://hukukasistani.com/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(infoData)
    })
    .then(response => {
        console.log('Response Status:', response.status);
        return response.json();
    })
    .then(result => {
        const rowsByThreadId = result.rowsByThreadId;
        const AIrowsByThreadId = result.AIrowsByThreadId;

        // CARDBOXLARIN YARATILDIGI KISIM
        // Get the container element where card boxes will be appended
        const dropdownContent = document.getElementById('dropdownContent');
        
        // Iterate over the keys of rowsByThreadId object (which represent user messages)
        for (const idoftheactualThread in rowsByThreadId) {
            // Create a card box for each key (thread ID)
            const historyDiv = document.createElement('div');
            historyDiv.classList.add("cardbox");
        
            // Retrieve user and AI messages for the current thread ID
            const userRows = rowsByThreadId[idoftheactualThread] || [];
            const aiRows = AIrowsByThreadId[idoftheactualThread] || [];
        
            // Interleave user and AI messages
            const maxLength = Math.max(userRows.length, aiRows.length);
            for (let i = 0; i < maxLength; i++) {
                // Add "Siz: " label for user messages
                if (userRows[i]) {
                    const userLabel = document.createElement('b');
                    userLabel.textContent = 'Siz: ';
                    historyDiv.appendChild(userLabel);
        
                    const userMessage = document.createElement('span');
                    userMessage.textContent = userRows[i].message;
                    userMessage.classList.add("usercardBoxText");
                    userMessage.style.display = 'block';
                    historyDiv.appendChild(userMessage);
                    historyDiv.appendChild(document.createElement('br'));
                }
        
                // Add "Yapay Zeka: " label for AI messages
                if (aiRows[i]) {
                    const aiLabel = document.createElement('b');
                    aiLabel.textContent = 'Hukuk Asistanı: ';
                    historyDiv.appendChild(aiLabel);
        
                    const aiMessage = document.createElement('span');
                    aiMessage.textContent = aiRows[i].aiMessage.replace(/\\n/g, "\r\n");;
                    aiMessage.classList.add("aicardboxText");
                    historyDiv.appendChild(aiMessage);
                    historyDiv.appendChild(document.createElement('br'));
                }
            }

            // CARDBOX'A TIKLAYINCA AÇILAN POPUP
            // Create an overlay for the box shadow appereance
            const overlay = document.createElement('div');
            overlay.classList.add("overlay");
            const sidebar = document.getElementById('sidebar');
            sidebar.appendChild(overlay);
            let overlayShown = false; // Add this flag

            historyDiv.addEventListener('click', function() {
                if (!overlayShown){
                    overlayShown = true;
                
                    // Save original styles
                    const originalStyles = {
                        position: historyDiv.style.position,
                        padding: historyDiv.style.padding,
                        cursor: historyDiv.style.cursor,
                        borderBottom: historyDiv.style.borderBottom,
                        backgroundColor: historyDiv.style.backgroundColor,
                        maxHeight: historyDiv.style.maxHeight,
                        overflowY: historyDiv.style.overflowY,
                        borderRadius: historyDiv.style.borderRadius,
                        width: historyDiv.style.width,
                        height: historyDiv.style.height,
                        left: historyDiv.style.left,
                        bottom: historyDiv.style.bottom,
                        boxShadow: historyDiv.style.boxShadow
                    };
                
                    // Update styles for expanded view
                    historyDiv.style.position = 'fixed';
                    historyDiv.style.padding = '10px';
                    historyDiv.style.borderBottom = '1px solid #ddd';
                    historyDiv.style.backgroundColor = '#f4f4f4';
                    historyDiv.style.maxHeight = '100vh';
                    historyDiv.style.overflowY = 'auto';
                    historyDiv.style.borderRadius = '4px';
                    historyDiv.style.width = '70vw';
                    historyDiv.style.height = '70vh';
                    historyDiv.style.left = '11%';
                    historyDiv.style.bottom = '10%';
                    historyDiv.style.boxShadow = '0px 0px 50px 20px rgba(0, 0, 0, 0.5)';
                    historyDiv.style.zIndex = '9999';

                    overlay.style.display = "block";

                    // Create print button
                    const printButton = document.createElement('button');
                    printButton.id = "printButton";

                    const image = document.createElement('img');
                    image.src = "assets/print.png";

                    historyDiv.appendChild(printButton);
                    printButton.appendChild(image);

                    printButton.addEventListener('click', () => {
                        window.print();
                    })

                    // Create close button
                    const closePopup = document.createElement('button');
                    closePopup.classList.add("closePopup");
                    closePopup.textContent = "X"
                    historyDiv.appendChild(closePopup);
                
                    closePopup.addEventListener('click', function(event){
                        // Restore original styles
                        event.stopPropagation();
                        Object.assign(historyDiv.style, originalStyles);
                        overlay.style.display = "none";
                        closePopup.remove(); // Remove close button
                        printButton.remove();
                        overlayShown = false; // Reset the flag
                    })
                }
            });
            // CARDBOX'A TIKLAYINCA AÇILAN POPUP
        
            // Append the card box to the container
            dropdownContent.insertBefore(historyDiv, dropdownContent.firstChild); // En sonuncu cardbox'u en başa alarak düzen sağla
        }
        
        // Eğer kullanıcının bedava kullanım hakkı bittiyse gönderme tuşuna erişimi kapat ve freeTrialEndedContainer'ı görünür yap.

        const freeTrialEndedContainer = document.getElementById('freeTrialEndedContainer');
        const centerContainer = document.getElementById('centerContainer');

        const freeTrialEnded = result.freeTrialEnded;
        if (freeTrialEnded === true){
            centerContainer.style.display = 'none';
            freeTrialEndedContainer.style.display = 'flex';
        }

        // Kullanıcının bilgilerinin profil sidebarında göründüğü kısım
        const name = document.getElementById('name');
        const surname = document.getElementById('surname');
        const subscriptionType = document.getElementById('subscriptionType');
        const remainingDays = document.getElementById('remainingDays');

        const dataName = result.name;
        const dataSurname = result.surname;
        const dataSubscriptionType = result.subscriptionType;
        const dataremainingDays = result.differenceInDaysString;

        name.textContent = `Ad: ${dataName}`;
        surname.textContent = `Soyad: ${dataSurname}`;

        const activityCheck = result.activityCheck;

        if(activityCheck !== "ACTIVE"){
            subscriptionType.textContent = "Üyelik Türü: Yok";
            remainingDays.textContent = "Kalan Günler: 0";

            const buyButton = document.getElementById('buyButton');
            buyButton.style.display = 'block';
        }
        else{
            if (dataSubscriptionType === "Aylık"){
                const cancelButton = document.getElementById('cancelButton');
                cancelButton.style.display = 'block';
            }

            subscriptionType.textContent = `Üyelik Türü: ${dataSubscriptionType}`;
            remainingDays.textContent = `Kalan Günler: ${dataremainingDays}`;
        }

        const centerContainerFetchHistory = document.getElementById('centerContainer');
        // Eğer spam yapan bir kullanıcı varsa serverda güvenlik tedbirini aldıktan sonra kullanıcıya bunu anlat
        const isRateLimitFull = result.isRateLimitFull;
        const spam = document.getElementById('spam');
        if (isRateLimitFull === true){
            console.log("Rate limit is full");
            centerContainerFetchHistory.style.display = 'none';
            spam.style.display = 'flex';
        }
    })
}
fetchHistory();

function aiAnswer(){
    const dotLoader = document.getElementById('dotLoader'); // Cevabın geldiğini gösteren üç nokta efektini aç
    dotLoader.style.visibility = 'visible';

    const inputinside = document.getElementById('inputinside').value;
            
    fetch('https://hukukasistani.com/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputinside,
            refreshCounter
        }),
    })
    .then(response => {
    
        console.log('Response Status:', response.status);
        return response.json()
    })
    .then(result => {
        console.log(result.google_response);
        // KONUŞMA ALANINDA VAR OLAN ÇOĞU ŞEY BURADA YAZILIYOR
    
        const centerContainer = document.getElementById('centerContainer');
        // Eğer kullanıcının bedava kullanım hakkı bittiyse gönderme tuşuna erişimi kapat ve freeTrialEndedContainer'ı görünür yap.
        const freeTrialEndedContainer = document.getElementById('freeTrialEndedContainer');
        const freeTrialEnded = result.freeTrialEnded;
        if (freeTrialEnded === true){
            centerContainer.style.display = 'none';
            freeTrialEndedContainer.style.display = 'flex';
        }
    
        const characterLengthSpamElement = document.getElementById('characterLengthSpam');
        const characterLengthAttack = result.characterLengthAttack;
        if (characterLengthAttack === true){
            centerContainer.style.display = 'none';
            characterLengthSpamElement.style.display = 'flex';
        }
    
        // Create a new <p> element for "Yapay Zeka: "
        const aiPrompt = document.createElement('p');
        aiPrompt.textContent = "Hukuk Asistanı:";
        aiPrompt.classList.add("aiheaderPDesign");
    
       // Create a new <p> element for the result
       const aiResponse = document.createElement('p');
       aiResponse.textContent = result.aiText.replace(/\\n/g, "\r\n"); // openai'ın gönderdiği cevaptaki newline işaretlerini yeniden formatla ve işe yarar hale getir
       aiResponse.classList.add("aiPDesign");
    
        // Append both <p> elements to the messages container
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.appendChild(aiPrompt);
        messagesContainer.appendChild(aiResponse);
    
        dotLoader.style.visibility = 'hidden'; // Cevabın geldiğini gösteren üç nokta efektini kapat
    
        refreshCounter = result.refreshCounter;
        console.log('Successful:', result);
    })
    .catch(error => {
        console.log('Error:', error);
    });

    // Get the user input
    const userInput = document.getElementById('inputinside').value;

    // Create a new <p> element
    const newMessage = document.createElement('p');
    newMessage.textContent = 'Siz:';
    newMessage.classList.add("userinputHeader");

    // Create another p element for the user input
    const userContent = document.createElement('p');
    userContent.textContent = (userInput);
    userContent.classList.add("userinputContent");

    // Append the new <p> element to the messages container
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.appendChild(newMessage);
    messagesContainer.appendChild(userContent);

    // Gönder'e bastıktan sonra alanı temizler.
    document.getElementById('inputinside').value = '';
    // Gönder'e bastıktan sonra varsayılan alanı temizler.

    if (document.getElementById('defaultmessage'))
    {
        document.getElementById('defaultmessage').remove();
        document.getElementById('defaultmessageTwo').remove();
        document.getElementById('defaultmessageThree').remove();
        document.getElementById('defaultmessageFour').remove();
        document.getElementById('defaultmessageFive').remove();
    }
    else
    {
        console.log("Default yazı bulunamadı...");
    };

}

function cancelSubscription(){
    const overlayForCancel = document.createElement('div');
    overlayForCancel.id = 'overlayForCancel';
    document.body.appendChild(overlayForCancel);

    const questionContainer = document.createElement('div');
    questionContainer.id = 'questionContainer';
    questionContainer.textContent = "İptal işlemini onaylıyor musunuz?"
    overlayForCancel.appendChild(questionContainer);

    const cancelIt = document.createElement('div');
    cancelIt.id = 'cancelIt';
    cancelIt.textContent = "Evet";
    questionContainer.appendChild(cancelIt);

    const dontCancel = document.createElement('div');
    dontCancel.id = 'dontCancel';
    dontCancel.textContent = "Hayır";
    questionContainer.appendChild(dontCancel);

    cancelIt.addEventListener('click',() => {
        const buttonClick = true;
        
        fetch('https://hukukasistani.com/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({buttonClick}),
        })
        .then(response => {
            return response.json()
        })
        .then(result => {
            if (result.subscriptionCancelled === true){
                location.reload(true);
            }
        });
    });

    dontCancel.addEventListener('click',() => {
        overlayForCancel.remove();
    });
}

function changePassword(){
    const changePasswordContainer = document.createElement('div');
    changePasswordContainer.id = 'changePasswordContainer';

    const changePasswordInput = document.createElement('input');
    changePasswordInput.id = 'changePasswordInput';
    changePasswordInput.name = 'changePasswordInput';
    changePasswordInput.placeholder = 'Yeni şifreniz:';
    changePasswordInput.type = 'text';

    const saveChangePassword = document.createElement('button');
    saveChangePassword.id = 'saveChangePassword';
    saveChangePassword.type = 'submit';
    saveChangePassword.textContent = "Kaydet";

    const sidebar = document.getElementById('sidebar');
    const dropdown = document.getElementById('dropdown');
    sidebar.insertBefore(changePasswordContainer, dropdown);
    changePasswordContainer.appendChild(changePasswordInput);
    changePasswordContainer.appendChild(saveChangePassword);

    saveChangePassword.addEventListener('click', () => {
        const changePasswordButtonClick = true;
        const newPassword = document.getElementById('changePasswordInput').value;
        const changesSaved = document.getElementById('changesSaved');

        fetch('https://hukukasistani.com/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({changePasswordButtonClick, newPassword}),
        })
        .then(response => {
            return response.json()
        })
        .then(result => {
            const passwordChangeSucces = result.passwordChangeSucces;
            if (passwordChangeSucces === true){
                changesSaved.style.display = 'flex';
                changesSaved.textContent = "Şifre başarıyla değiştirildi!";

                setTimeout(function() {
                    changesSaved.style.display = 'none';
                }, 5000);
        
                changePasswordContainer.remove();
            }
            else{
                changesSaved.style.display = 'flex';
                changesSaved.textContent = "Şifre değiştirme başarısız oldu. Lütfen tekrar deneyin.";

                setTimeout(function() {
                    changesSaved.style.display = 'none';
                }, 5000);
        
                changePasswordContainer.remove();
            }
        });
    })
}