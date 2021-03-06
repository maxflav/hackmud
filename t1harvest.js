function(context, args)
{
  var corp = args.corp

  var locset = new Set()
  for(var i = 0; i < 10; i++) {
    for (var loc of harvestFrom(corp))
      locset.add(loc)
  }

  var locs = Array.from(locset.values())
  if (!locs) return {ok: false}

  var ret = "";
  for (var i = 0; i <= locs.length; i+=50) {
    var j = 0;
    ret += "\n\nmax.t1crack{"+locs.slice(i,i+50).map(loc => (j++) + ":#s." + loc).join(",\n")+"}\n\n"
  }
  return ret

  function harvestFrom(corp) {
    var corruption = /[¡¢Á¤Ã¦§¨©ª<>]/

    var c1 = corp.call({})
    try {
      var key = / with ([^:]*):/.exec(c1)[1]
      var dir = /with [^:]*:"([^<" ]*)"/.exec(c1)[1]
    } catch(e) {
      return []
    }

    try{
      var c0 = corp.call()
      c0 = c0.split("\n")
    }catch(e){
      return []
    }

    c0 = c0[c0.length-1].split("|").map(s => s.trim())
    var blog = c0[0]
    var about = c0[1]
    var about_msg = corp.call({[key]: about})
    try{
      var pw = /strategy ([^ ]*)/.exec(about_msg)[1]
    }catch(e){
      return []
    }

    var regexes = [
      /^([^ ]*) announces beta/g,
      /backstarters for ([^ ]*) /g,
      /of project ([^ ]*) /g,
      /developments on ([^ ]*) /g,
      /release date for ([^ ]*)\. /g,
      /review of ([^ ]*)\. /g,
    ]
    var projs = [];
    var blog_msg = corp.call({[key]: blog})
    for (var r of regexes) {
      var match;
      while (match = r.exec(blog_msg)) {
        projs.push(match[1])
      }
    }

    var passkey;
    for (passkey of ["p","pass","password"]) {
      if (/Incorrect/.exec(corp.call({[key]: dir, [passkey]:"."}))) break;
    }

    var locs = []

    var loc_reg = /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/g
    for (var proj of projs) {
      var dir_resp = corp.call({[key]: dir, [passkey]: pw, "project": proj})
      if (!Array.isArray(dir_resp)) return []
      for (var loc of dir_resp) {
        if (!corruption.exec(loc)) locs.push(loc)
      }
    }
    return locs
  }
}
