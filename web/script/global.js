function languageChange() {
    alert('Sistema de mudança de linguagem ainda em desenvolvimento.')
}

function redirect(GoTo) {
    const Queries = window.location.pathname.substring(1, window.location.pathname.length);
    const WebsiteURL = window.location.href.replace(Queries, '');
    window.location.href = `${WebsiteURL}${GoTo}`
}

function yourAccount() {
  if (localStorage.getItem('account_token')) return redirect('account/dashboard');
  return redirect('account');
};