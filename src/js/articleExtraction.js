function parseArticleFromURL(URL) {
  const getJSONP = (url) => {
  	return new Promise((res, rej) => {
  		url = "http://www.whateverorigin.org/get?url=" + encodeURIComponent(url);
  		url += "&callback=?";
          let ud = '_callback_jsonp',
              script = document.createElement('script'),
              head = document.getElementsByTagName('head')[0]
                     || document.documentElement;
  
          window[ud] = function(data) {
              head.removeChild(script);
              res(data.contents);
          };
  
          script.src = url.replace('callback=?', 'callback=' + ud);
          head.appendChild(script);
      });
  };
  const getSource = url => {
    const b64E = (str) => {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }
    let u = "https://louisfelixberthiaume.000webhostapp.com/SourcesEEIL/scrape.php/";
    u += b64E(url);
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", u, false);
    xmlHttp.send(null);
    return new Promise(res => {
      if (xmlHttp.responseText) {
        res(xmlHttp.responseText);
      }
    });
  }
  const getURL = (url) => {
    return getSource(url).then((s) => {
      let js = [];
      URL = s.substring(4, s.indexOf(" -->"));
      s = s.slice(s.indexOf(" -->") + 4);
      let sCopy = s;
      const retrieveURL = (url, res) => {
        if (res.indexOf("../") + 1) {
          let header = url.split("://")[0] + "://";
          url = url.slice(url.indexOf("://") + 3);
          let back = res.match(/\.\.\//g).length + 2;
          res = res.replace(/\.\.\//g, "");
          let path = url.slice(url.indexOf("/")).split("/");
          let base = url.split("/")[0];
          path.splice(0, back);
          res = header + base + "/" + path + res;
          return res;
        } else if (!(res.indexOf("://") + 1)) {
          res = url + res;
          return res;
        } else {
          return res;
        }
      };
      while (s.indexOf("src=") + 1) {
        let str = s[s.indexOf("src=") + 4];
        s = s.slice(s.indexOf("src=") + 5);
        let c = s.substr(0, s.indexOf(str));
        if (c.indexOf(".js") + 1 && c.indexOf("../") + 1)
          js.push(s.substr(0, s.indexOf(str)));
      }
      js = js.map(x => retrieveURL(url, x));
      let secureJS = js.filter(x => x.indexOf("https://") !== -1);
      for (let script in secureJS) {
        let s = document.getElementById("tempCont")[doc].body.firstChild;
        s.parentNode.insertBefore(js[script], s);
      }
      js = js.filter(x => x.indexOf("https://") === -1);
      for (let e in js)
        getSource(js[e]).then(x => js[e] = x);
      return new Promise(res => {
        res([js, sCopy]);
      });
    });
  };
  return getURL(URL).then((x) => {
    let js = x[0];
    let sCopy = x[1];
    const scriptToURL = (s) => {
      let p = "data:text/javascript,";
      return p + encodeURIComponent(s);
    };
    let serv = "/storage/ssd5/881/1571881/public_html/SourcesEEIL/scrape.php";
    js = js.filter(x => x.indexOf(serv) === -1);
    js = js.map(x => scriptToURL(x));
    let iframe = document.createElement("iframe");
    let doc = "";
    iframe.id = "tempCont";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    if (iframe.contentDocument) {
      doc = "contentDocument";
    } else {
      doc = "contentWindow";
    }
    for (let script in js) {
      let res = document.createElement("script");
      res.type = "text/javascript";
      res.src = js[script];
      js[script] = res;
    }
    s = sCopy;
    document.getElementById("tempCont")[doc].body.innerHTML = s;
    for (let script in js) {
      let s = document.getElementById("tempCont")[doc].body.firstChild;
      s.parentNode.insertBefore(js[script], s);
    }
    document.getElementById("tempCont")[doc].body.innerHTML = document.getElementById("tempCont")[doc].body.innerHTML;
    document.getElementById("tempCont")[doc].body.onload = function() {
      let script = document.getElementById("tempCont")[doc].body.getElementsByTagName("script");
      let txt = "";
      for (let s = 0; s < script.length; s++)
        txt += script[s].text;
      frames[0].window.eval(txt);
    };
    return new Promise((res) => {
      let oldHead = "null";
      let delay = window.setInterval(() => {
        try {
          if (oldHead === document.getElementById("tempCont")[doc].head.innerHTML) {
            let arg = document.getElementById("tempCont")[doc].body.parentNode.outerHTML;
            res(arg);
            window.clearInterval(delay);
          }
          oldHead = document.getElementById("tempCont")[doc].head.innerHTML;
        }
        catch(e) {
          return "ERROR " + e;
        }
      }, 500);
    });
  }).then(html => {
    document.body.removeChild(document.getElementById("tempCont"));
    let container = document.createElement("div");
    container.innerHTML = html;
    let containerTitle = "";
    if(typeof container.getElementsByTagName("title")[0] !== "undefined")
      containerTitle = container.getElementsByTagName("title")[0].innerText;
    return (function() {
      let maxNet = (array, m) => {
        let maxCount = 0;
        let max = "";
        let conditions = s => {
          if (m === "author") {
            let minCount = 0;
            s.split(" ").forEach(x => {
              if (x.charAt(0) === x.charAt(0).toLowerCase() && s.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g) !== null) {
                minCount++;
              }
            });
            return s.match(/[A-Z]/g) !== null && s.includes(" ") && minCount < 2;
          } else {
            return s.match(/[a-zA-Z]/g) !== null;
          }
        }
        for (let i = 0; i < array.length; i++) {
          let tempArray = [].concat(array);
          tempArray = tempArray.map(x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-z]/g, "").toLowerCase());
          let count = 0;
          for (let a = 0; a < tempArray.length; a++) {
            if (tempArray[a].indexOf(tempArray[i]) !== -1) {
              count++;
            }
          }
          if (count > maxCount && conditions(array[i])) {
            maxCount = count;
            max = array[i];
          }
        }
        if (m === "author" && max === "") {
          max = array[0];
        }
        return max;
      };
      let author = (function() {
        let a;
        try {
          a = (function() {
            let author = maxNet((function() {
              let containsRestriction = str => {
                for (let i = 0; i < bannedKeyWords.length; i++) {
                  if (str.indexOf(bannedKeyWords[i]) !== -1) {
                    return true;
                  }
                }
                return false;
              }
              let el = container.getElementsByTagName("meta");
              const keyWords = ["author", "byl", "auteur", "autor", "Author", "Auteur", "redaction"];
              const bannedKeyWords = ["comment", "Comment", "000webhost", "image", "Image", "book", "Book"];
              let p = [];
              for (let i = 0; i < el.length; i++) {
                for (let k = 0; k < keyWords.length; k++) {
                  if (el[i].name.indexOf(keyWords[k]) !== -1) {
                    p.push(el[i].content);
                  }
                }
              }
              const bEl = ["span", "div", "a", "p", "section", "h3", "li"];
              let properties = ["id", "class", "name", "href", "title", "rel", "itemprop"];
              for (let e = 0; e < bEl.length; e++) {
                el = container.getElementsByTagName(bEl[e]);
                for (let i = 0; i < el.length; i++) {
                  for (let pr = 0; pr < properties.length; pr++) {
                    for (let k = 0; k < keyWords.length; k++) {
                      if ((el[i].getAttribute(properties[pr]) || "").indexOf(keyWords[k]) !== -1 && !containsRestriction(el[i].getAttribute(properties[pr]))) {
                        if (el[i].innerHTML.match("<br>") === null) {
                          let sanitText = Array(el[i].innerText).map(x => {
                            let n = x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) !== null ? x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/).index : 0;
                            x = x.slice(n)
                            n = x.split("").reverse().join("").match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) !== null ? x.split("").reverse().join("").match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/).index : 0;
                            x = x.split("").reverse().join("").slice(n).split("").reverse().join("");
                            return x
                          }).toString().split(/\r\n|\r|\n/g).map(x => {
                            if (x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) === null) {
                              return null;
                            } else {
                              return x.trim();
                            }
                          }).filter((obj) => obj).join("\n")
                          if (sanitText.match(/\r\n|\r|\n/g) === null) {
                            p.push(el[i].innerText);
                          } else {
                            if (sanitText.split(/\r\n|\r|\n/g)[0].match(":") === null) {
                              p.push(sanitText.split(/\r\n|\r|\n/g)[0]);
                            } else {
                              p.push(sanitText.split(":")[1].trim().split(/\r\n|\r|\n/g)[0]);
                            }
                          }
                        } else {
                          let microCont = document.createElement("div");
                          microCont.innerHTML = el[i].innerHTML.split("<br>")[0];
                          p.push(microCont.innerText);
                        }
                      }
                    }
                  }
                }
              }
              let ln = container.innerText.split(/\r\n|\r|\n/g);
              let textualKeyWords = ["exte de "];
              for (let i = 0; i < ln.length; i++) {
                for (let tK = 0; tK < textualKeyWords.length; tK++) {
                  if (ln[i].indexOf(textualKeyWords[tK]) !== -1) {
                    p.push(ln[i].split(textualKeyWords[tK])[1].split(" de")[0]);
                  }
                }
              }
              p = p.map(x => {
                let n = x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) !== null ? x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/).index : 0;
                x = x.slice(n)
                n = x.split("").reverse().join("").match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) !== null ? x.split("").reverse().join("").match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/).index : 0;
                x = x.split("").reverse().join("").slice(n).split("").reverse().join("");
                return x
              });
              p = p.map(x => x.replace(/  /g, " "));
              return p;
            })(), "author").replace("Par ", "").replace("By ", "").replace("De ", "").trim();
            if (author.indexOf("PAR ") === 0) {
              author = author.slice(4);
            }
            if (author.indexOf("BY ") === 0) {
              author = author.slice(3);
            }
            if (author.indexOf("DE ") === 0) {
              author = author.slice(3);
            }
            if (author.indexOf(" par ") !== -1) {
              author = author.split(" par ")[1];
            }
            if (author.indexOf(" by ") !== -1) {
              author = author.split(" by ")[1];
            }
            author = author.split(/\r\n|\r|\n/g)[0];
            author = author.split(" -")[0];
            for (let i = author.length - 1; i > 0; i--) {
              if (author[i].match(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g) !== null) {
                author = author.split("");
                author[i] = "#";
                author = author.join("");
              } else {
                break;
              }
            }
            author = author.replace(/#/g, "");
            author = author.split(",")[0];
            if (author.indexOf(":") !== -1) {
              author = author.split(": ")[1];
            }
            if (!(author.includes(" ")) || author.replace(/[A-Z]/, "").match(/[A-Z]/) === null) {
              return "S.A.";
            }
            let binRep = 1 <= author.split(" ").map(x => Number(x[0].toLowerCase() === x[0])).join("").replace(/0/g, "").length;
            if (binRep && author.indexOf(" et ") === -1 && author.indexOf(" and ") === -1) {
              return "S.A.";
            }
            let tempAuthor = author;
            let aRep = [];
            for (let i = 0; i < author.replace(/[^-]/g, "").length; i++) {
              aRep[i] = tempAuthor.indexOf("-");
              tempAuthor = tempAuthor.replace("-", "");
            }
            tempAuthor = author.split("-").map(x => x.split(" ")).toString().split(",").map(x => {
              let fX = x.split("")[0].toUpperCase();
              x = x.slice(1).toLowerCase();
              x = fX + x;
              return x;
            }).join(" ");
            for (let i = 0; i < aRep.length; i++) {
              tempAuthor = tempAuthor.split("");
              tempAuthor[aRep[i]] = "-";
              tempAuthor = tempAuthor.join("");
            }
            author = tempAuthor;
            return author;
          })();
        } catch (e) {
          a = "S.A.";
        }
        return a;
      })();

      let website = (function() {
        return (function() {
          let el = container.getElementsByTagName("meta");
          let keyWords = ["site_name", "creator"];
          let att = ["property", "name"]
          let p = [];
          let containsRestriction = str => {
            for (let i = 0; i < bannedKeyWords.length; i++) {
              if (str !== null) {
                if (str.indexOf(bannedKeyWords[i]) !== -1) {
                  return true;
                }
              }
            }
            return false;
          }
          let bannedKeyWords = ["sponsor", "Sponsor", "promot", "Promot", "secur", "000webhost", "logout", "Logout"];
          for (let i = 0; i < el.length; i++) {
            for (let k = 0; k < keyWords.length; k++) {
              for (let a = 0; a < att.length; a++) {
                if (el[i].hasAttribute(att[a])) {
                  if (el[i].getAttribute(att[a]).indexOf(keyWords[k]) !== -1) {
                    if (el[i].content.indexOf("@") === -1) {
                      for (let w = 0; w < 2; w++) {
                        p.push(el[i].content);
                      }
                    } else {
                      p.push(el[i].content);
                    }
                  }
                }
              }
            }
          }
          el = container.getElementsByTagName("img");
          const imgAtt = ["class", "src"];
          for (let i = 0; i < el.length; i++) {
            for (let a = 0; a < imgAtt.length; a++) {
              if (el[i].hasAttribute(imgAtt[a])) {
                if (el[i].getAttribute(imgAtt[a]).indexOf("logo") !== -1) {
                  if (!containsRestriction(el[i].getAttribute("alt"))) {
                    p.push(el[i].getAttribute("alt"));
                  }
                }
                if (el[i].getAttribute(imgAtt[a]).indexOf("logo") !== -1) {
                  if (!containsRestriction(el[i].getAttribute("title"))) {
                    p.push(el[i].getAttribute("title"));
                  }
                }
              }
            }
          }
          let cont = ["span", "div", "a"];
          let textualKeyWords = ["logo", "accueil", "©"];
          att = ["class", "id", "name", "title", "innerText"];
          for (let c = 0; c < cont.length; c++) {
            el = container.getElementsByTagName(cont[c]);
            for (let i = 0; i < el.length; i++) {
              for (let k = 0; k < textualKeyWords.length; k++) {
                for (let a = 0; a < att.length; a++) {
                  if (el[i].hasAttribute(att[a])) {
                    if (el[i].getAttribute(att[a]).indexOf(textualKeyWords[k]) !== -1) {
                      if (el[i].hasAttribute("title")) {
                        let tt = el[i].getAttribute("title");
                        if (tt.match(new RegExp(textualKeyWords[k], "i")) === null) {
                          if(!containsRestriction(el[i].getAttribute("title")))
                            p.push(el[i].getAttribute("title"));
                        }
                      }
                      let t = el[i].innerText;
                      let r = new RegExp(textualKeyWords[k], "i");
                      if (!containsRestriction(t)) {
                        t = t.replace(r, "");
                        t = t.trim();
                        p.push(t);
                      }
                    }
                  }
                }
              }
            }
          }
          if (container.innerText.indexOf("©") !== -1) {
            let attempts = (function() {
              let copyrightInfo = "";
              container.innerText.split(/\r\n|\r|\n/g).forEach(x => {
                if (x.indexOf("©") !== -1) {
                  copyrightInfo = x;
                }
                return x;
              });
              return copyrightInfo.split("©");
            })();
            let l = attempts.length - 1;
            let s = attempts[l - 1].length < attempts[l].length ? attempts[l - 1] : attempts[l];
            s = s.split("inc")[0];
            s = s.replace(/[^À-ÖØ-öø-ÿa-zA-Z ]/g, "");
            s = s.trim();
            p.push(s);
          }
          p = p.filter((obj) => obj);
          let tempName;
          if (typeof p[0] === "undefined" || p[0].match(/[A-Z]/) === null) {
            tempName = URL.split("//")[1].split("/")[0].split(".").reduce(function(a, b) {
              return a.length > b.length ? a : b
            }, "");
            tempName = tempName.split("")[0].toUpperCase() + tempName.slice(1).toLowerCase();
            p.push(tempName);
          }
          let splitters = [" - ", " – ", " | ", " — ", " / "];
          for (let i = 0; i < splitters.length; i++) {
            if (containerTitle.indexOf(splitters[i]) !== -1) {
              let tempArray = containerTitle.split(splitters[i]);
              let temp = tempArray[tempArray.length - 1].trim();
              if (temp.match(/[A-Z]/) !== null) {
                for (let i = 0; i < 2; i++) {
                  p.push(temp);
                }
              } else if (temp.match(/[a-zA-Z]/) !== null) {
                p.push(temp);
              }
            }
          }
          p = p.filter((obj) => obj);
          for (let i = 0; i < p.length; i++) {
            if (p[i] !== null) {
              if (p[i].match(/[a-zA-Z]/) === null) {
                p.splice(i, 1)
              }
              if (p[i].split("")[0] === "@") {
                p[i] = p[i].slice(1);
              }
            }
          }
          if (URL.indexOf("logo") === -1) {
            for (let i = 0; i < p.length; i++) {
              if (p[i].match(/logo/i) !== null) {
                p[i] = null;
              }
            }
          }
          p = p.filter((obj) => obj);
          for (let i = 0; i < p.length; i++) {
            if (p[i].match(/\r\n|\r|\n/g) !== null) {
              p[i] = null;
            }
          }
          p = p.filter((obj) => obj);
          p = p.map(x => {
            let n = x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) !== null ? x.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/).index : 0;
            x = x.slice(n)
            n = x.split("").reverse().join("").match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/) !== null ? x.split("").reverse().join("").match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/).index : 0;
            x = x.split("").reverse().join("").slice(n).split("").reverse().join("");
            return x
          });
          let m = maxNet(p);
          if (m.indexOf(" ") === -1 && m.length <= 4) {
            m = m.toUpperCase();
          }
          let tempM = m.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-z]/g, "").toLowerCase();
          let mCC = m.match(/[A-ZÀ-ÖØ-öø-ÿ ]/g);
          let maxComplexity = mCC === null ? 0 : mCC.length;
          for (let i = 0; i < p.length; i++) {
            if (p[i] !== null) {
              let tempP = p[i].normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-z]/g, "").toLowerCase();
              if (tempP === tempM) {
                let pCC = p[i].match(/[A-ZÀ-ÖØ-öø-ÿ ]/g);
                let complexityScore = pCC === null ? 0 : pCC.length;
                if (complexityScore > maxComplexity) {
                  maxComplexity = complexityScore;
                  m = p[i];
                }
              }
            }
          }
          if (URL.match(/inc/i) === null) {
            m = m.split("Inc")[0].trim();
          }
          m = m.split(".")[0].trim();
          m = m.charAt(0).toUpperCase() + m.slice(1);
          if (m === "") {
            tempName = URL.split("//")[1].split("/")[0].split(".").reduce(function(a, b) {
              return a.length > b.length ? a : b
            }, "");
            tempName = tempName.split("")[0].toUpperCase() + tempName.slice(1).toLowerCase();
            m = tempName;
          }
          return m;
        })();
      })()

      let article = (function() {
        let el = container.getElementsByTagName("h1");
        let p = [];
        for (let i = 0; i < el.length; i++) {
          p.push(el[i].innerText);
        }
        let splitters = [" - ", " – ", " | ", " — ", " / "];
        for (let i = 0; i < splitters.length; i++) {
          if (containerTitle.indexOf(splitters[i]) !== -1) {
            let tempArray = containerTitle.split(splitters[i]);
            let temp = tempArray[0].trim();
            p.push(temp);
          }
        }
        p.push(containerTitle);
        p = p.sort(function(a, b) {
          return b.length - a.length;
        });
        return maxNet(p);
      })();
      const exceptions = [
        {
      		url: "lefigaro.fr",
      		website: "Le Figaro"
      	},
        {
      		url: "sante.lefigaro.fr",
      		website: "Le Figaro Santé"
      	},
      	{
      		url: "usherbrooke.ca",
      		website: "Université de Sherbrooke"
      	}
      ];
      for(let e in exceptions) {
      	if(URL.indexOf(exceptions[e].url) !== -1) {
      		website = exceptions[e].website ? exceptions[e].website : website;
      		author = exceptions[e].author ? exceptions[e].author : author;
      		article = exceptions[e].article ? exceptions[e].article : article;
          }
      }
      return {
        "website": website.trim(),
        "title": article.trim(),
        "author": author.trim(),
        "url": URL.trim()
      };
    })();
  });
}