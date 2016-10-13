var update_scoreboard = function(){
 $.getJSON( "scoreboard_data", function(data) {
   var entries = "";
   var teamstat = data['teamstat'];
   var challenges = data['challenges'];
   var solved_challenge = data['solved_challenge'];
   var total = {};

   for( var c in challenges ) {
     chal = challenges[c]
     total[chal['id']] = 0;
   }

   var rank = 1
   for( var t in teamstat) {
     team = teamstat[t]
     entries += "<tr class='entry'>";
     entries += "<td>" + escape_html(rank) + "</td>";
     entries += "<td style='word-wrap:break-word;'><a class='team-url' href='/team/" + escape_html((team['id'])) + "'>"
                 + escape_html(String(team["name"])) + "</a></td>";
     entries += "<td> <img src=/static/flags/" + team["country"] + ".gif></img> </td>";
     entries += "<td>" + escape_html(String(team["score"])) + "</td>"
     rank +=1
     for( var c in challenges) {
       chal = challenges[c]
       var solved_chal = 0;
       for(  s in solved_challenge[team['id']] ) {
         solved_chal = solved_challenge[team['id']][s]
         if( solved_chal == chal['id'] ) {
           total[chal['id']] += 1;
           break;
         }
       }
       if( solved_chal  != chal['id'] ){
         entries += "<td class='unsolved'></td>";
       }else{
         entries += "<td class='solved show-on-hover'><div>"+escape_html(String(chal['name']))+"</div></td>";
       }

     }
     entries += "</tr>";
   }

   thead_tr = '<th style="width:50px;">Rank</th>'
     + '<th style="width:160px;">Team Name</th>'
     + '<th style="width:65px;">Country</th>'
     + '<th style="width:65px;">Score</th>';
   for( var c in challenges ) {
     chal = challenges[c]
     thead_tr += '<th class="flag show-on-hover"><span class="glyphicon glyphicon-flag"></span><div>' + escape_html(String(chal['name'])) +
                 " (" + escape_html(String(chal['score'])) + ")" + "<p>" + escape_html(total[chal['id']]) + " solves</p></div></th>";
   }

   $("#scoreboard thead tr").html(thead_tr);

   total_entry = "<tr><td id='total-title' colspan=4>Total</td>";

   for( var c in challenges ) {
     chal = challenges[c];
     total_entry += "<td>" + escape_html(total[chal['id']]) + "</td>";
   }
   entries += total_entry;
   $("#scoreboard tbody").html(entries);
   $("#last-update").text("Last Update: " + data['last_update']);
 });
};
update_scoreboard();
setInterval(update_scoreboard, 30000);
