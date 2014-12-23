// url string
var pathname = window.location.pathname.split('/')[2];
var hostname = $(location).attr('href').split('/APP/')[0];
var urls = hostname + '/API/' + pathname;

//check app login status
var request = $.ajax({
    url: urls + "/ucheck",
    type: "GET",
    cache: false,
    async: false
});
request.done(function (data) {
    if (data.result == -2) {
        location.href = './member.html';
    };
});
request.fail(function (data) {
    console.log(data);
});