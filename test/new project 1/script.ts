async function register() {
  try {
    const username = (document.getElementById("regUsername") as HTMLInputElement).value;
    const password = (document.getElementById("regPassword") as HTMLInputElement).value;

    if (!username || !password) {
      (document.getElementById("regMsg") as HTMLElement).innerText = "All fields are required";
      return;
    }

    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    (document.getElementById("regMsg") as HTMLElement).innerText = data.message;

  } catch (error) {
    console.error(error);
    (document.getElementById("regMsg") as HTMLElement).innerText = "Server error";
  }
}

async function login() {
  try {
    const username = (document.getElementById("loginUsername") as HTMLInputElement).value;
    const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

    if (!username || !password) {
      (document.getElementById("loginMsg") as HTMLElement).innerText = "All fields are required";
      return;
    }

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    (document.getElementById("loginMsg") as HTMLElement).innerText = data.message;

  } catch (error) {
    console.error(error);
    (document.getElementById("loginMsg") as HTMLElement).innerText = "Server error";
  }
}
