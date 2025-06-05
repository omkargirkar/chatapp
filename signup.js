function handleSignup(event) {
    event.preventDefault();
  
    const username = event.target.username.value;
    const email = event.target.email.value;
    const tel = event.target.tel.value;
    const password = event.target.password.value;
  
    const user = { username, email, tel, password };
  
    fetch("/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          document.getElementById("message").textContent = err.error;
          throw new Error(err.error);
        });
      }
      return res.json();
    })
    .then(data => {
      alert(data.message);
      event.target.reset();
    })
    .catch(err => {
      console.error(err);
    });  
  }
  