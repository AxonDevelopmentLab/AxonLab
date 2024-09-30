let already_showing_message = false;
function message(Text, Color) {
    if (already_showing_message) return;
    already_showing_message = true;
    document.getElementById('callback.message').style.color = Color;
    document.getElementById('callback.message').innerHTML = Text;
    setTimeout(() => {
        already_showing_message = false;
        document.getElementById('callback.message').innerHTML = '<br>';
    }, 5000);
}

function block_download() {
    document.getElementById('callback.message').style.color = 'Color';
    document.getElementById('callback.message').innerHTML = 'Entre na sua conta para fazer o download.';
}

if (document.getElementById('callback.message') && !localStorage.getItem('account_token')) block_download();
function downloadApp(Name) {
    if (document.getElementById('callback.message') && !localStorage.getItem('account_token')) return block_download();
    $.post(`https://axon-services.glitch.me/downloadService`, { service: Name, account_token: localStorage.getItem('account_token') }, function(data){
        if (data.status === 400) return message('Não foi possível fazer o download.', 'red');
        if (data.status === 401) {
            localStorage.clear();
            return block_download();
        };

        const Queries = window.location.pathname.substring(1, window.location.pathname.length);
        const WebsiteURL = window.location.href.replace(Queries, '');
        window.open(`${WebsiteURL}discord`, '_blank')
        window.location.href = data.url;
    });
} 