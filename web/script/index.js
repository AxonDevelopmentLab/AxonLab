let currentNew = 0;

function changeNew() {
  currentNew++;
  const getNew = document.getElementById('news.' + currentNew);
  if (getNew !== null) {
    const getOldNew = document.getElementById(`news.${(currentNew - 1)}`)
    if (getOldNew) getOldNew.style.display = "none";
    document.getElementById(`news.${currentNew}`).style.display = "block";
  } else {
    document.getElementById(`news.${(currentNew - 1)}`).style.display = "none";
    document.getElementById('news.' + '1').style.display = "block";
    currentNew = 0;
  }
}

changeNew();
setInterval(() => { changeNew(); }, 7000);