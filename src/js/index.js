Element.prototype.appendAfter = function(element) {
  element.parentNode.insertBefore(this, element.nextSibling);
}, false;
const getElement = (e, id) => {
  let el = document.getElementById(currentPage());
  el = el.getElementsByTagName(e);
  el = Array.from(el);
  let R
  el.forEach(x => {
    if (x.id === id)
      R = x;
  });
  return R;
}
const getType = () => location.hash.split("-")[0].slice(1);
async function handleButton(e) {
  let lang = ["bt-french", "bt-english", "bt-spanish"];
  let C = e.target.id;
  lang = lang.indexOf(C);
  let data = pullData(lang);
  if (getElement("input", "reduceURL2").checked)
    data.url = await reduceURL(data.url);
  let ref = generateReference(getType(), data, lang);
  ref = btoa(encodeURIComponent(ref));
  location.hash += "-display-" + ref;
}
const getLocaleMonthArray = (L) => ([...Array(12).keys()].map(x => x + 1)).map(x => x.toString().padStart(2, "0")).map(x => new Date(`2001-${x}-01`).toLocaleDateString(L, {
  year: "numeric",
  month: "long",
  day: "numeric"
}).replace(/[0-9]|,| de|de /g, "").trim()).map(x => x[0].toUpperCase() + x.slice(1));
const translateMonth = (month, lang) => {
  let langHeader = ["fr-CA", "en-US", "es-ES"];
  let A = getLocaleMonthArray(langHeader[0]);
  let B = getLocaleMonthArray(langHeader[lang]);
  return B[A.indexOf(month)];
}
const reflow = () => document.body.offsetHeight;
const display = (ref) => {
  const copyToClipboard = (a) => {
    const b = document.createElement("textarea");
    b.value = a, b.setAttribute("readonly", ""), b.style.position = "absolute", b.style.left = "-9999px", document.body.appendChild(b);
    const c = !!(0 < document.getSelection().rangeCount) && document.getSelection().getRangeAt(0);
    b.select(), document.execCommand("copy"), document.body.removeChild(b), c && (document.getSelection().removeAllRanges(), document.getSelection().addRange(c))
  };
  Swal.fire({
    title: '<strong>Source générée</strong>',
    type: 'success',
    html: "<a class='display'>" + ref + "</a>",
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: 'Copier',
    cancelButtonText: 'Générer une autre source'
  }).then(x => {
    x = x[Object.keys(x)[0]];
    if (x === true) {
      copyToClipboard(ref);
    }
    let h = location.hash.split("");
    h = h.splice(0, location.hash.indexOf("-")).join("");
    location.hash = h;
  });
}
const getAuthorCount = () => {
  let C = document.getElementById(currentPage());
  C = C.getElementsByTagName("input");
  C = Array.from(C).filter(x => x.name === "cb-author");
  R = 0;
  C.forEach((a, i) => {
    if (a.checked)
      R = i;
  });
  return R;
}
const pullData = (lang) => {
  let data = {};
  data.authorCount = getAuthorCount();
  let el = document.getElementById(currentPage());
  el = el.getElementsByTagName("input");
  el = Array.from(el);
  el = el.filter(x => x.type === "text");
  let cP = document.getElementById(currentPage());
  let A = cP.getElementsByTagName("select");
  A = Array.from(A).forEach(x => el.push(x));
  el.forEach(e => {
    data[e.id] = e.value;
  });
  if (data.date === "")
    data.date = getDate(lang);
  if (!!data.author2)
    data.author = data.author + "; " + data.author2;
  if (!!data.month)
    data.month = translateMonth(data.month, lang);
  let numberTypes = ["number", "volume", "pages", "pageCount", "pubYear", "year", "page", "lengthMin"];
  for (let t in numberTypes) {
    if (!!data[numberTypes[t]])
      data[numberTypes[t]] = data[numberTypes[t]].replace(/[^0-9-]/g, "");
  }
  return data;
}
const createRef = () => {
  location.hash += "-loading";
  reflow();
  let target = event.target || event.srcElement;
  let id = target.id
  window.setTimeout(() => {
    let bitly = document.getElementById("reduceURL1").checked;
    let url = document.getElementById("url-express").value
    id = id.split("-")[1][0];
    let lang = ["f", "e", "s"];
    lang = lang.indexOf(id);
    generateExpress(url, lang, bitly).then(x => {
      let h = location.hash.split("");
      location.hash = h.splice(0, h.indexOf("-")).join("");
      location.hash += "-display-" + btoa(encodeURIComponent(x));
    });
  }, 100)
}
const getDate = (lang) => {
  let C = document.getElementById(currentPage());
  C = C.getElementsByTagName("input");
  C = Array.from(C).filter(x => x.name === "cb-date");
  R = 0;
  C.forEach((a, i) => {
    if (a.checked)
      R = i;;
  });
  let d;
  if (!R) {
    d = new Date();
  } else if (!(R - 1)) {
    d = new Date();
    d = d.setDate(new Date().getDate() - 1);
    d = new Date(d);
  } else {
    d = new Date();
    d = d.setDate(new Date().getDate() - 2);
    d = new Date(d);
  }
  let options = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  let langHeader = ["fr-CA", "en-US", "es-ES"];
  d = d.toLocaleDateString(langHeader[lang], options);
  return d;
}
const generateExpress = (url, lang, bitly) => {
  return new Promise((res) => {
    parseArticleFromURL(url).then(x => {
      let langHeader = ["fr-CA", "en-US", "es-ES"];
      let date = new Date();
      let options = {
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      date = date.toLocaleDateString(langHeader[lang], options);
      x.date = date;
      let c = !!(x.author.indexOf(" and ") + 1) || !!(x.author.indexOf(" et ") + 1);
      x.authorCount = 1;
      if (c)
        x.authorCount = 2;
      if (x.author === "S.A.")
        x.authorCount = 0;
      if (bitly) {
        reduceURL(x.url).then(y => {
          x.url = y;
          res(generateReference("site_internet", x, lang));
        });
      } else {
        res(generateReference("site_internet", x, lang));
      }
    });
  });
};
const reduceURL = (url) => {
  let u = "https://louisfelixberthiaume.000webhostapp.com/SourcesEEIL/reduce.php?";
  u += encodeURIComponent(url);
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", u, false);
  xmlHttp.send(null);
  return new Promise(res => {
    if (xmlHttp.responseText) {
      res(xmlHttp.responseText);
    }
  });
};
const checkCount = (name) => {
  let checkbox = document.getElementsByName(name);
  let i = 0;
  for (let e in checkbox) {
    if (checkbox[e].checked)
      i = i + 1;
  }
  return i;
}
const newOption = (value) => {
  let el = document.createElement("option");
  el.value = el.innerHTML = value;
  return el.outerHTML
}
const currentPage = () => {
  try {
    let P = Array.from(document.getElementsByClassName("page_div"));
    let R = "";
    for (let i in P)
      R = P[i].style.display !== "none" ? i : R;
    return P[R].id;
  } catch (e) {
    return location.hash.slice(1) + "_div";
  }
}
const updateUI = () => {
  let list = document.getElementsByClassName("aside-list")[0].scrollHeight;
  let height = list + 300;
  height = Math.max(height, window.innerHeight)
  document.getElementsByClassName("aside-left")[0].style.height = height.toString() + "px";
  document.getElementsByClassName("aside-right")[0].style.height = height.toString() + "px";
  document.getElementsByClassName("halfText")[0].style.width = "120px";
  document.getElementsByClassName("monthSelect")[0].style.width = "225px";
}
const hideAll = () => {
  let div = document.getElementsByTagName("div");
  for (let i = 0; i < div.length; i++) {
    if (div[i].parentNode.tagName === "BODY")
      document.getElementsByTagName("div")[i].style.display = "none";
  }
}
const show = (id) => {
  document.getElementById(id).style.display = "initial";
}
const createButton = (name) => {
  let li = document.createElement("li");
  li.className = "list";
  document.getElementsByClassName("aside-list")[0].appendChild(li);
  let a = document.createElement("a");
  a.innerHTML = name;
  a.id = flattenClass(name);
  a.className = "aside-anchor";
  a.addEventListener("click", handleClick, false);
  let last = document.getElementsByClassName("aside-list").length;
  document.getElementsByClassName("aside-list")[last - 1].appendChild(a);
}
const handleClick = (e) => {
  location.hash = e.currentTarget.id;
}
const flattenClass = (c) => {
  return c.toLowerCase().replace(/ /g, "_").normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
const types = ["Site Internet", "Monographie", "Périodique", "Maîtrise ou thèse", "Notes de cours", "Publication gouvernementale", "Ouvrage de référence", "Courriel", "Quotidien", "Entrevue", "Reportage", "Photographie", "Blogue"];
const initCheckbox = (name) => {
  Array.from(document.getElementsByName(name)).map(x => x.onclick = handleCheckbox);
}
const init = () => {
  initCheckbox("cb-author");
  initCheckbox("cb-date");
  const c = (x) => {
    let a = x.parentNode.id.indexOf("exception") === -1;
    let b = x.innerText.indexOf("Générer") !== -1;
    return a && b;
  }
  let B = Array.from(document.getElementsByTagName("button"));
  B = B.filter(x => c(x))
  B = B.map(x => x.onclick = handleButton);
  getLocaleMonthArray("fr-CA").forEach(x => {
    let a = document.getElementsByClassName("monthSelect")[0];
    a.innerHTML += newOption(x);
  });
  document.body.className = "all-loaded"
  if (!location.hash)
    location.hash = "#accueil";
  document.getElementById("exception").getElementsByTagName("button")[0].onclick = function() {
    createRef(event);
  }
  handleHashChange();
}
const handleHashChange = () => {
  scroll(0, 0);
  hideAll();
  document.body.className = "all-loaded";
  let h = location.hash
  if (h.indexOf("accueil") !== -1) {
    show("accueil_div");
    document.title = "Accueil | Sources ÉÉIL";
    let childrenCount = document.getElementsByTagName("ul")[0].childNodes;
    childrenCount = Array.from(childrenCount).filter(x => x.tagName === "A");
    childrenCount = childrenCount.length;
    if (!childrenCount) {
      for (let e in types)
        createButton(types[e]);
    }
  }
  if (h.indexOf("a_propos") !== -1)
    show("a_propos_div"), document.title = "À propos | Sources ÉÉIL";
  let currentType = types.map(x => flattenClass(x));
  currentType = currentType.filter(x => h.indexOf(x) + 1)
  let flatTypes = types.map(x => flattenClass(x));
  let type = location.hash.slice(1);
  flatTypes = flatTypes.indexOf(type);
  type = types[flatTypes];
  if (currentType.length)
    show(currentType + "_div"), document.title = type + " | Sources ÉÉIL";
  if (h.indexOf("display") !== -1) {
    let arg = h.split("-");
    arg = arg[arg.length - 1];
    display(decodeURIComponent(atob(arg)));
  }
  if (h.indexOf("loading") !== -1) {
    reflow();
    Swal.fire({
      title: 'Chargement...',
      text: 'Génération de la source en cours...',
      imageUrl: 'https://loading.io/spinners/infinity/lg.infinity-rotate-cycle-loader.gif',
      imageHeight: 75,
      animation: true,
      showConfirmButton: false
    });
  }
  if (getElement("button", "dropdown-button-1"))
    getElement("button", "dropdown-button-1").addEventListener("click", function() {
      dropdownClickHandler("1")
    }, false);
  if (getElement("button", "dropdown-button-2"))
    getElement("button", "dropdown-button-2").addEventListener("click", function() {
      dropdownClickHandler("2")
    }, false);
  updateUI();
}
let displayLang1 = false;
let displayLang2 = false;
let dropdownClickHandler = (x) => {
  if (window["displayLang" + x]) {
    hideLang(x);
  } else {
    showLang(x);
  }
}
let showLang = (x) => {
  window["displayLang" + x] = true;
  getElement("button", "dropdown-button-" + x).innerHTML = "▲";
  let eng = document.createElement("button");
  eng.id = "bt-english";
  eng.innerHTML = "Générer en anglais";
  eng.type = "submit";
  eng.onclick = function() {
    if (x === "1")
      createRef(event);
    if (x === "2")
      handleButton(event);
  };
  let spanish = document.createElement("button");
  spanish.id = "bt-spanish";
  spanish.innerHTML = "Générer en espagnol";
  spanish.type = "submit";
  spanish.onclick = function() {
    if (x === "1")
      createRef(event);
    if (x === "2")
      handleButton(event);
  };
  getElement("div", "lang_div_" + x).appendChild(eng);
  getElement("div", "lang_div_" + x).appendChild(spanish);
}
let hideLang = (x) => {
  window["displayLang" + x] = false;
  getElement("button", "dropdown-button-" + x).innerHTML = "▼";
  getElement("button", "bt-english").remove();
  getElement("button", "bt-spanish").remove();
}
const handleCheckbox = (e) => {
  if (checkCount(e.target.name) > 1)
    Array.from(document.getElementsByName(e.target.name)).map(x => x.checked = false);
  e.target.checked = true;
  A = getAuthorCount();
  if (!A) {
    getElement("input", "author").setAttribute("disabled", "");
    if (getElement("div", "author_div_2").childNodes[0])
      getElement("div", "author_div_2").childNodes[0].remove();
  } else if (!(A - 1)) {
    getElement("input", "author").removeAttribute("disabled");
    getElement("input", "author").placeholder = "Nom de l'auteur";
    if (getElement("div", "author_div_2").childNodes[0])
      getElement("div", "author_div_2").childNodes[0].remove();
  } else if (!(A - 2)) {
    let el = document.createElement("input");
    el.type = "text";
    el.id = "author2";
    el.placeholder = "Nom du deuxième auteur";
    let element = getElement("div", "author_div_2");
    if (!element.childNodes[0])
      element.appendChild(el);
    getElement("input", "author").placeholder = "Nom du premier auteur";
  } else {
    getElement("input", "author").placeholder = "Nom du premier auteur";
    if (getElement("div", "author_div_2").childNodes[0])
      getElement("div", "author_div_2").childNodes[0].remove();
  }
}
