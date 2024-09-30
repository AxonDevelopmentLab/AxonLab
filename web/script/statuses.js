const services = {
  "instalockapp": "https://raw.githubusercontent.com/AxonDevelopmentLab/services/main/appload/instalock.json",
  "axonservices": "https://axon-services.glitch.me/",
  "axsc": "https://axsc.glitch.me/",
  "axonsync": "https://axonsync.glitch.me/",
  "axoncdn": "https://axon-cdn.glitch.me/"
}

function setOffline(Element) {
  Element.style.color = '#ff0000';
  Element.innerHTML = 'Offline';
}

function setOnline(Element) {
  Element.style.color = '#37ff00';
  Element.innerHTML = 'Online';
}

function setMaintence(Element) {
  Element.style.color = '#fff700';
  Element.innerHTML = 'Manutenção';
}

function getStatus() {
  for (const service of Object.keys(services)) {
    const getElement = document.getElementById(`${service}.status`);
    try {
      getElement.innerHTML = 'Obtendo dados...';
      fetch(services[service]).then(response => {
        if (!response.ok) return setOffline(getElement);
        response.json().then((data) => {
          if (!data) setOffline(getElement)
          if (data.maintence) setMaintence(getElement);
          if (data && !data.maintence) setOnline(getElement);
        }).catch(noJson => {
          setOffline(getElement);
        })
      }).catch(error => {
        setOffline(getElement);
      });
    } catch (err) {
      setOffline(getElement);
    }
  }
}

getStatus();
setInterval(() => getStatus(), (1000 * 60 * 5));