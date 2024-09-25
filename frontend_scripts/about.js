const dummy = 'dummy';

fetch('https://hukukasistani.com/hakkinda', {
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
.then(res => {
    // 6 Aylık kullanıcılar

    const sixMonthUsers = res.sixMonthUsers;

    // Initialize an empty array to store the concatenated values
    let namesAndSurnames = [];
            
    // Iterate over the results array
    for (let i = 0; i < sixMonthUsers.length; i++) {
        // Concatenate the name and surname with a space separator
        namesAndSurnames.push(sixMonthUsers[i].name + " " + sixMonthUsers[i].surname);
    }

    // Join the array elements with ", " as separator
    const concatenatedNames = namesAndSurnames.join(", ");
    
    // Set the concatenated names as content of the 'supporters' element
    const sixMonthSupporters = document.getElementById('sixMonthSupporters');
    sixMonthSupporters.textContent = concatenatedNames;

    // 1 Yıllık kullanıcılar

    const oneYearUsers = res.oneYearUsers;
    // Initialize an empty array to store the concatenated values
    let namesAndSurnames2 = [];
            
    // Iterate over the results array
    for (let i = 0; i < oneYearUsers.length; i++) {
        // Concatenate the name and surname with a space separator
        namesAndSurnames2.push(oneYearUsers[i].name + " " + oneYearUsers[i].surname);
    }

    // Join the array elements with ", " as separator
    const concatenatedNames2 = namesAndSurnames2.join(", ");
    
    // Set the concatenated names as content of the 'supporters' element
    const oneYearSupporters = document.getElementById('oneYearSupporters');
    oneYearSupporters.textContent = concatenatedNames2;
});