const generateReference = (type, args, lang) => {
  const dictionary = {
  	edition: ["éd.", "ed", "ed"],
  	coll: ["(coll. x)", "(x coll.)", "(x col.)"],
  	and: ["et", "and", "y"],
  	uniDoc: [["Mémoire de M.A.", "Thèse de Ph.D."], ["Master's degree", "Ph.D. thesis"], ["Master", "Tesis doctorales"]],
  	interview: ["Entrevue avec ", "Interview with ", "Entrevista con "],
  	ref: ["réf. du ", "ref. from ", "ref. del "],
  	online: ["en ligne", "online", "en línea"],
  	url: ["adresse URL: ", "URL: ", "dirección URL: "],
  	pub: ["page publiée le ", "page published on ", "página publicada en "],
  	notes: ["notes du cours ", "notes from ", "notas del curso "],
  	ab: ["e", "th", "a"],
  	ab1: ["re", "st", "a"],
  	ab2: ["e", "nd", "a"],
  	ab3: ["e", "rd", "a"]
  }
  if(typeof args.authorCount !== "number")
    args.authorCount = Number(args.authorCount);
  const fAuthor = (x) => {
  	const n = args.authorCount;
  	if(!n)
  		x = "S.A.,"
  	if(n === 1) {
  	  if(x.split(" ")[0].length < 4 && x.split(" ").length > 2) {
  	    x = x.split("");
  	    x[x.indexOf(" ")] = "¯";
		    x = x.join("");
  	    x = x.slice(x.indexOf(" ")).toUpperCase()+", "+x.split(" ")[0] + ".";
  	    x = x.replace("¯", " ");
  	  } else {
  		  x = x.slice(x.indexOf(" ")).toUpperCase()+", "+x.split(" ")[0] + ".";
  	  }
  	}
  	if(n === 2) {
  		x = x.split("; ")
  		x[0] = x[0].slice(x[0].indexOf(" ")).toUpperCase()+", "+x[0].split(" ")[0];
  		x[1] = x[1].split(" ")[0] +","+ x[1].slice(x[1].indexOf(" ")).toUpperCase();
  		x = x[0].trim() + " " + dictionary.and[lang] + " " + x[1] + "."
  	}
  	if(n === 3) {
  		x = x.slice(x.indexOf(" ")).toUpperCase()+", "+x.split(" ")[0] + " <i>et al.</i>,";
  	}
  	if(x[x.length - 2] === ".")
      x = x.substring(0, x.length - 1);
  	return x.trim();
  }
  const str = (x) => x.toString();
  let ref = "";
  switch(type) {
    case "monographie":
      args.author = fAuthor(args.author) + " ";
      ref = args.author;
      ref += "<i>" + args.title + "</i>" + ", ";
      ed = args.edition;
      if(ed) {
        let ab = str(ed) + dictionary.ab[lang];
        if(ed === "1")
          ab = str(ed) + dictionary.ab1[lang];
        if(ed === "2")
          ab = str(ed) + dictionary.ab2[lang];
        if(ed === "3")
          ab = str(ed) + dictionary.ab3[lang];
        args.edition = ab;
      	args.edition = str(args.edition) + " " + dictionary.edition[lang];
      	ref += args.edition + ", ";
      }
      city = args.city;
      if(city)
      	ref += city + ", ";
      pub = args.pub;
      if(pub)
      	ref += pub + ", ";
      ref += args.pubDate + ", " + args.pageCount + " p.";
      coll = args.coll;
      if(coll)
      	ref += ", " + dictionary.coll[lang].replace("x", coll);
      break;
    case "periodique":
      ref = fAuthor(args.author) + " ";
      ref += "« " + args.article +  " », ";
      ref += "<i>" + args.magazine + "</i>, ";
      if(args.volume)
      	ref += "vol. " + args.volume + ", ";
      ref += "n<sup>o</sup> " + args.number;
      ref += " (" + args.month + " " + args.year + "), ";
      ref += "p. " + args.pages;
      break;
    case "maitrise_ou_these":
      ref = fAuthor(args.author) + " ";
      ref += "<i>" + args.title + "</i>, ";
      ref += dictionary.uniDoc[lang][args.type];
      ref += " (" + args.subject.toLowerCase() + "), ";
      ref += args.university + ", ";
      ref += args.pubYear + ", ";
      ref += args.pageCount + " p.";
      break;
    case "publication_gouvernementale":
      ref = args.region.toUpperCase();
      ref += " (" + args.regionType + "), ";
      ref += args.ministere.toUpperCase() + ". ";
      ref += "<i>" + args.title + "</i>, ";
      if(args.city)
      	ref += args.city + ", ";
      if(args.editor)
      	ref += args.editor + ", ";
      ref += args.pubYear + ", ";
      ref += args.pageCount + " p.";
      break;
    case "ouvrage_de_reference":
      ref = fAuthor(args.author) + " ";
      ref +=  "« " + args.article +  " », ";
      ref += "<i>" + args.book + "</i>, ";
      ref += args.city + ", ";
      ref += args.editor + ", ";
      ref += args.pubYear + ", ";
      ref += "p. " + args.page;
      break;
    case "courriel":
      ref = fAuthor(args.author) + " ";
      ref += args.email + ", ";
      ref += "« " + args.subject +  " », ";
      ref += args.date + ".";
      break;
    case "quotidien":
      ref = fAuthor(args.author) + " ";
      ref += "« " + args.title +  " », ";
      ref += args.newspaper + " (" + args.city + "), ";
      ref += "n<sup>o</sup> " + args.number;
      ref += " (" + args.date + "), ";
      ref += "p. " + args.page + ".";
      break;
    case "entrevue":
      a = args.interviewer;
      args.job = args.job.toLowerCase();
      ref =  a.slice(a.indexOf(" "))+", "+a.split(" ")[0] + ". ";
      ref += "<i>" + dictionary.interview[lang] + args.interviewed + "</i>, ";
      ref += args.job + ", ";
      ref += args.city + ", ";
      ref += args.date + ".";
      break;
    case "site_internet":
      ref = fAuthor(args.author) + " ";
      ref += args.website + ", ";
      ref += "(" + dictionary.ref[lang] + args.date + "), ";
      ref += "<i>" + args.title;
      ref += " [" + dictionary.online[lang] + "]</i>, ";
      ref += dictionary.url[lang] + args.url;
      break;
    case "reportage":
      ref = fAuthor(args.author) + " ";
      ref += "« " + args.title +  " », ";
      ref += "<i>" + args.show + "</i>, ";
      if(args.city)
      	ref += args.city + ", ";
      ref += args.broadcaster;
      ref += " (" + args.date + "), ";
      ref += args.lengthMin + " min, ";
      ref += args.type;
      break;
    case "photographie":
      ref = fAuthor(args.author) + " ";
      ref += "<i>" + args.title + "</i>";
      if(args.city)
      	ref += ", " + args.city;
      if(args.year)
      	ref += ", " + args.year + ".";
      break;
    case "blogue":
      ref = fAuthor(args.author) + " ";
      ref += args.title + ", ";
      ref += dictionary.online[lang][0].toUpperCase() + dictionary.online[lang].slice(1);
      ref += " : " + args.url;
      ref += " (" + dictionary.pub[lang] + args.date + ").";
      break;
    case "notes_de_cours":
      ref = fAuthor(args.teacher) + " ";
      ref += "<i>" + args.theme + "</i>, ";
      ref += dictionary.notes[lang] + args.sigle + " ";
      ref += "« " + args.course +  " », ";
      ref += args.city + ", ";
      ref += args.date + ", ";
      ref += str(args.pageCount) + " p.";
      break;
    default:
      console.error("ERROR: undefined type: '" + type + "'")
  }
  return ref;
}
