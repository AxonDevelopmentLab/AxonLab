if (!localStorage.getItem('account_token')) redirect('account')
    let first_time_update = false;
    let formulary_action = '';
    let isMessage = false;
    
    const account = {
        username: undefined,
        email: undefined,
        plan: undefined,
        discord: undefined
    };
    
    function updateAccount() {
        $.post(`https://axon-services.glitch.me/auth/login`, {
            raw: true,
            token: localStorage.getItem('account_token'),
            getdata: ['account']
        }, function(data){
            if (data.status !== 200) return logout();
    
            account.username = data.account.username;
    
            let email = 'Não definido.'
            if (data.account.email !== "false") email = data.account.email;
            account.email = email;
    
            let plan = 'Nenhum';
            if (data.account.plan > 0) plan = 'Premium';
            account.plan = plan;
    
            let discord = `Nenhum discord vinculado. Vincule o seu discord para ganhar recompensas.<br>Vincule em: <a onclick="window.location.href='https://axonlab.glitch.me/vinculate-discord/'">https://axonlab.glitch.me/vinculate-discord/</a>`;
            if (data.account.connections && data.account.connections.Discord) discord = data.account.connections.Discord.Username;
            account.discord = discord;
    
            if (!first_time_update) {
                first_time_update = true;
                changePage("details");
            };
        });
    }
    updateAccount();
    
    function logout() {
        localStorage.clear();
        redirect('account');
    };
    
    const elements = {
        title: document.getElementById('title'),
        description: document.getElementById('description'),
        callback: document.getElementById('callback'),
        formulary: document.getElementById('all_formulary'),
        formulary_1: document.getElementById('field_1'),
        formulary_2: document.getElementById('field_2'),
        formulary_3: document.getElementById('field_3'),
        button: document.getElementById('button')
    };
    
    function formulary(PlaceholdersArray, Button) {
        elements.formulary_1.value = "";
        elements.formulary_2.value = "";
        elements.formulary_3.value = "";
    
        if (PlaceholdersArray[0]) elements.formulary_1.placeholder = PlaceholdersArray[0];
    
        if (PlaceholdersArray[1]) {
            elements.formulary_2.style.display = 'block';
            elements.formulary_2.placeholder = PlaceholdersArray[1];
        };
    
        if (PlaceholdersArray[2]) {
            elements.formulary_3.style.display = 'block';
            elements.formulary_3.placeholder = PlaceholdersArray[2];
        };
    
        elements.button.innerHTML = Button;
        elements.formulary.style.display = "block";
    }
    
    function changePage(ForPage) {
        elements.formulary_2.style.display = 'none';
        elements.formulary_3.style.display = 'none';
        elements.formulary.style.display = "none";
        elements.title.innerHTML = '<br>';
        elements.description.innerHTML = '<br>';
        const pages = {
            "details": () => {
                elements.title.innerHTML = `Olá! bem-vindo(a) ${account.username}.`
                elements.description.innerHTML = `Você está na sua dashboard, aqui você pode gerenciar a sua conta.<br><br><b>Seu nome de usuário</b><br>${account.username}<br><br><b>Seu E-Mail</b><br>${account.email}<br><br><b>Seu Discord:</b><br>${account.discord}`
            },
            "plan": () => {
                elements.title.innerHTML = 'Sua Assinatura';
                elements.description.innerHTML = `<b>Seu plano:</b><br>${account.plan}<br><br>Você sabia que ao adquirir <b>Premium</b> você ganha acesso ilimitado a todos serviços da AxonLab?<br>Entre em contato com o suporte para adquirir premium.`
            },
            "change_username": () => {
                elements.title.innerHTML = 'Mudar o Nome de Usuário.';
                formulary(
                    [
                        'Seu novo nome de usuário',
                        'Sua senha',
                        'Confirme a sua senha'
                    ],
                    'Alterar'
                );
            },
            "change_password": () => {
                elements.title.innerHTML = 'Alterar a sua senha.';
                formulary(
                    [
                        'Sua senha antiga',
                        'Sua nova senha',
                        'Confirme a sua nova senha'
                    ],
                    'Alterar'
                );
            },
            "change_email": () => {
                elements.title.innerHTML = 'Alterar o seu E-mail';
                elements.description.innerHTML = 'Devido a razões de segurança, para alterar o seu e-mail será necessário entrar em contato com o suporte, seja pelo Discord, ou por <b>contact.akkui@proton.me</b>.<br><br>No suporte, irão realizar uma validação do seu e-mail atual e do novo, então irão alterar o seu e-mail para você.<br><br>O suporte tem um tempo médio de resposta de <b>menos de 8 Horas</b>.'
            },
            "account_delete": () => {
                elements.title.innerHTML = 'Deletar a sua conta.';
                elements.description.innerHTML = 'Ao deletar a sua conta, ela será bloqueada por <b>1 Semana</b>, e somente após esse prazo ela terá todos seus dados deletados do nosso banco de dados.<br><br>Durante o prazo de uma semana, você não poderá reutilizar os mesmos dados da sua conta para criar uma nova, isso só será possível após a exclusão completa do banco de dados.'
                formulary(
                    [
                        'Sua senha',
                        'Confirme a sua senha',
                        'Escreva "deletar" para confirmar'
                    ],
                    'Deletar'
                );
            }
        }
    
        for (const item of Object.keys(pages)) document.getElementById(`item.${item}`).style.color = '#FFFFFF';
        document.getElementById(`item.${ForPage}`).style.color = '#9d0839'
        formulary_action = ForPage;
        pages[ForPage]();
    }
    
    function message(Text, Color) {
        if (isMessage) return;
        isMessage = true;
        elements.callback.style.color = Color;
        elements.callback.innerHTML = Text;
        setTimeout(() => { isMessage = false; elements.callback.innerHTML = '<br>'; }, 2000)
    };
    
    function sendFormulary() {
        $.post(`https://axon-services.glitch.me/account/edit`, {
            token: localStorage.getItem('account_token'),
            action: formulary_action,
            field_1: elements.formulary_1.value,
            field_2: elements.formulary_2.value,
            field_3: elements.formulary_3.value,
        }, function(data){
            if (data.status === 200) return location.reload()
            if (data.status === 401) return logout();
            message(data.message.text, data.message.color);
        });
    }
    
    elements.formulary_1.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); sendFormulary(); } })
    elements.formulary_2.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); sendFormulary(); } })
    elements.formulary_3.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); sendFormulary(); } })