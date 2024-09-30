let typeOf = 'login';
let isMessage = false;
const elements = {
    title: document.getElementById('title'),
    changeText: document.getElementById('change.text'),
    confirmPassword: document.getElementById('confirm.password'),
    username: document.getElementById('username'),
    button: document.getElementById('button.text')
}

function message(Text, Color) {
    if (isMessage) return;
    isMessage = true;
    const element = document.getElementById('callback.message');
    element.style.color = Color;
    element.innerHTML = Text;
    setTimeout(() => { isMessage = false; element.innerHTML = '<br>'; }, 2000);
}

function changeMode(SelectedMode) {
    const modes = {
        "register": () => {
            typeOf = 'register';
            elements.title.innerHTML = 'Crie a sua<br>conta.'
            elements.changeText.innerHTML = `Já tem uma conta? Clique <b onclick="changeMode('login')" style="cursor:pointer;">aqui</b> para entrar.`
            elements.username.style.display = 'block';
            elements.confirmPassword.style.visibility = 'visible';
            elements.button.innerHTML = 'CRIAR';
        },
        "login": () => {
            typeOf = 'login';
            elements.title.innerHTML = 'Entre na sua conta.'
            elements.changeText.innerHTML = `Não tem uma conta? Clique <b onclick="changeMode('register')" style="cursor:pointer;">aqui</b> para criar a sua conta.`
            elements.username.style.display = 'none';
            elements.confirmPassword.style.visibility = 'hidden';
            elements.button.innerHTML = 'ENTRAR';
        }
    };

    modes[SelectedMode]();
}

const email = document.getElementById('email');
const username = document.getElementById('username');
const password = document.getElementById('password');
const confirmpassword = document.getElementById('confirm.password');

function logonAccount() {
    const modes = {
        "register": () => {
            $.post(`https://axon-services.glitch.me/auth/register`, {
                email: email.value,
                username: username.value,
                password: password.value,
                confirm_password: confirmpassword.value
            }, function(data){
                email.value = ''; username.value = ''; password.value = ''; confirmpassword.value = '';
                message(data.message.text, data.message.color);
            });
        },
        "login": () => {
            $.post(`https://axon-services.glitch.me/auth/login`, {
                email: email.value,
                password: password.value,
                getdata: ['account']
            }, function(data){
                console.log(data)
                email.value = ''; username.value = ''; password.value = ''; confirmpassword.value = '';
                if (data.status !== 200) return message(data.message.text, data.message.color);
                localStorage.setItem('account_token', data.account.token);

                const currentUrl = new URL(window.location.href);
                const params = new URLSearchParams(currentUrl.search);
                const redirect_param = params.get('redirectTo');
                let redirect_content = params.get('passContent');
                if (redirect_content) redirect_content = redirect_content.split(',');

                if (redirect_param !== null) {
                    let first_param = true;
                    let url = redirect_param + '?';

                    const acceptedParaments = {
                        "id": () => {
                            if (!first_param) url = url + '&';
                            url += `id=${data.account.id}`;
                            first_param = false;
                        },
                        "code": () => {
                            if (!first_param) url = url + '&';
                            url += `code=${params.get('code')}`;
                            first_param = false;
                        }
                    };

                    if (redirect_content) for (const content of redirect_content) try { acceptedParaments[content]() } catch (err) { undefined };
                    window.location.href = url;
                } else {
                    location.reload();
                }
            });
        }
    };

    modes[typeOf]();
}

email.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); logonAccount(); } })
username.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); logonAccount(); } })
password.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); logonAccount(); } })
confirmpassword.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); logonAccount(); } })