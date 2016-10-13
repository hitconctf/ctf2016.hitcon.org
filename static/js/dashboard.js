var update_mini_scoreboard = function(){
	$.getJSON( "/dashboard/mini_scoreboard_data", function(data) {
		var entries = "";
		var teamstat = data['teamstat'];
		for( var t in teamstat ) {
			team = teamstat[t];
			entries += "<tr class='entry'>";
			entries += "<td>" + escape_html(team["name"]) + "</td>";
			entries += "<td>" + escape_html(team["score"]) + "</td>";
			entries += "</tr>";
		}
		$("#mini-scoreboard tbody").html(entries);
		$("#last-update").text("Last Update: " + data['last_update']);
	});
};
update_mini_scoreboard();
//setInterval(update_mini_scoreboard, 30000);

var update_dashboard_problems = function(){
	$.get("/dashboard/problem", function(data){
		$('#dashboard-problems').html(data);
	});
};
update_dashboard_problems();
//setInterval(update_dashboard_problems, 30000);

var csrftoken = $.cookie ("csrftoken");
function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
	beforeSend: function(xhr, settings) {
		if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
			xhr.setRequestHeader("X-CSRFToken", csrftoken);
		}
	}
});

function submitFlag()
{
	$('#submit-status').text('');
	$.post ("/dashboard/submit_flag",
		{"flag":  $("#flag").val() },
		function (data, textStatus, jqXHR) {
			if (data == 'error') {
				$('#submit-status').text('Slow down! submit your flag later.');
			} else if (data == 'duplicated') {
				$('#submit-status').text('You already submit this flag!.');
				$('#flag').val('')
			} else if (data) {
				var problem_obj = $("#problem-id-" + data);
				problem_obj.fadeOut(400, function(){
					problem_obj.addClass('solved');
					problem_obj.fadeIn(400);
				});
				$('#submit-status').text('Correct flag. Grats!');
				$('#flag').val('')
				update_announcements();
			} else {
				$('#submit-status').text('Wrong flag. Noooooo~');
			}
		}).fail(function(){
			$('#submit-status').text('Submission error. Please try again later.');
		});
}

$("#flag_submit_button").on("click", function () {
	submitFlag();
});

$("#flag").on("keyup", function (e) {
	var code = (e.keyCode ? e.keyCode : e.which);
	if ( code == 13 ) {
		submitFlag();
	}
});

ANNOUNCEMENTS_UPDATE_INTERVAL = 30000;

// handling function for successfully fetching announcements
function fetch_announcements_success(data)
{
	elem_ul = $("#dashboard-announcements > ul");
	curr_count = elem_ul.children().length;
	is_first_query = (curr_count == 0);

	for (index = data.length - curr_count - 1; index >= 0; index--)
	{
		announcement = data[index];

		elem_description = $("<div></div>")
			.text(announcement["description"])
			.css("display", "none");

		elem_title = $("<a></a>")
			.text(announcement["time"] + ": " + announcement["title"])
			.attr("href", "javascript:void(0)")
			.click(function() {
					$(this).parent().children("div").slideToggle('fast');
					});

		elem_entry = $("<li></li>")
			.append(elem_title)
			.append(elem_description);

		if (is_first_query) {
			elem_entry.prependTo(elem_ul);
		} else {
			elem_entry.prependTo(elem_ul).slideDown().fadeOut().fadeIn().fadeOut().fadeIn();
		}
	}
}

// handling function for failing to fetch announcements
function fetch_announcements_fail(jqXHR)
{
	console.error('failed to fetch announcements');
}

// periodly update announcements
function update_announcements()
{
	$.ajax({url: window.location.origin + "/dashboard/announcement_data",
			dataType: "json",
			success: fetch_announcements_success,
			error: fetch_announcements_fail});
}

update_announcements();
//setInterval(update_announcements, ANNOUNCEMENTS_UPDATE_INTERVAL);

// problem info popup
$(document).on('click', '.problem-entry.unlocked', function(){
	var info_obj = $(this).children('.problem-info');
	var info = {
		'title': info_obj.children('.title').children('p').children('.tititle').html(),
		'description': info_obj.children('.description').html(),
		'hint': info_obj.children('.hint').html().trim(),
		'solved_times': info_obj.children('.solved_times').html().trim()
	};
	$.fancybox('<div class="fancybox-contents">' +
		'<h1>' + info.title + '</h1>' +
		'<p>' + info.solved_times + '</p>' +
		'<h3>Description</h3><p>' + info.description + '</p>' +
		'<h3>Hint</h3><p>' + (info.hint ? info.hint : 'None') + '</p>' +
		'</div>',
		{'width': 700, 'height': 500});
});
