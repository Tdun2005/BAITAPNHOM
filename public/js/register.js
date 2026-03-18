document.getElementById("registerForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const gender = document.getElementById("gender").value;
    const birth_date = document.getElementById("birth_date").value;
    const province = document.getElementById("province").value;
    const district = document.getElementById("district").value;
    const address_detail = document.getElementById("address_detail").value.trim();

    const message = document.getElementById("message");

    // DEBUG xem frontend gửi gì
    console.log({
        username,
        full_name,
        email,
        password,
        phone,
        gender,
        birth_date,
        province,
        district,
        address_detail
    });

    try {

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                full_name,
                email,
                password,
                phone,
                gender,
                birth_date,
                province,
                district,
                address_detail
            })
        });

        const data = await response.json();

        message.innerText = data.message;

        if(response.status === 201){

            message.style.color = "green";

            // reset form
            document.getElementById("registerForm").reset();

        }else{

            message.style.color = "red";

        }

    } catch(error){

        console.error(error);

        message.innerText = "Server connection error";
        message.style.color = "red";

    }

});