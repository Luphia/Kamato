$(document).ready(function () {
    (function () {
        $('body').on('click touchstart', '.box-switcher', function (e) {
            e.preventDefault();
            var box = $(this).attr('data-switch');
            $(this).closest('.box').toggleClass('active');
            $('#' + box).closest('.box').addClass('active');
        });

        /* --------------------------------------------------------
        Checkbox + Radio
        -----------------------------------------------------------*/
        if ($('input:checkbox, input:radio')[0]) {

            //Checkbox + Radio skin
            $('input:checkbox:not([data-toggle="buttons"] input, .make-switch input), input:radio:not([data-toggle="buttons"] input)').iCheck({
                checkboxClass: 'icheckbox_minimal',
                radioClass: 'iradio_minimal',
                increaseArea: '20%' // optional
            });

            //Checkbox listing
            var parentCheck = $('.list-parent-check');
            var listCheck = $('.list-check');

            parentCheck.on('ifChecked', function () {
                $(this).closest('.list-container').find('.list-check').iCheck('check');
            });

            parentCheck.on('ifClicked', function () {
                $(this).closest('.list-container').find('.list-check').iCheck('uncheck');
            });

            listCheck.on('ifChecked', function () {
                var parent = $(this).closest('.list-container').find('.list-parent-check');
                var thisCheck = $(this).closest('.list-container').find('.list-check');
                var thisChecked = $(this).closest('.list-container').find('.list-check:checked');

                if (thisCheck.length == thisChecked.length) {
                    parent.iCheck('check');
                }
            });

            listCheck.on('ifUnchecked', function () {
                var parent = $(this).closest('.list-container').find('.list-parent-check');
                parent.iCheck('uncheck');
            });

            listCheck.on('ifChanged', function () {
                var thisChecked = $(this).closest('.list-container').find('.list-check:checked');
                var showon = $(this).closest('.list-container').find('.show-on');
                if (thisChecked.length > 0) {
                    showon.show();
                }
                else {
                    showon.hide();
                }
            });
        }

        //open new url window
        function opennew(url, title, w, h) {
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        };

        var QueryString = function () {
            // This function is anonymous, is executed immediately and 
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = pair[1];
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], pair[1]];
                    query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            }
            return query_string;
        }();

        // when change password link ready
        if (QueryString.a && QueryString.p) {
            $('.box').removeClass('active');
            $('#box-register').addClass('active');
            $('.raccount').hide();
            $('#box-register h2').text('Change New Password');
            $('.register').text('Change New Password');
            $('.register').addClass('newpassword');
            $('.register').removeClass('register');
        };

        // url string
        var pathname = window.location.pathname.split('/')[2];
        var hostname = $(location).attr('href').split('/APP/')[0];
        var urls = hostname + '/API/' + pathname;

        //register
        $('.register').click(function (e) {
            e.preventDefault();

            if ($('.rpassword').val() == $('.rpassword2').val()) {
                var request = $.ajax({
                    url: urls + "/uregist",
                    type: "POST",
                    data: { account: $(".raccount").val(), password: $(".rpassword").val() },
                    cache: false,
                    async: false
                });
                request.done(function (data) {
                    if (data.result == 1) {
                        location.href = hostname + '/APP/' + pathname + "/selectAPP.html";
                    };
                    console.log(data.result);
                });
                request.fail(function (data) {
                    console.log(data);
                });
            } else {
                alert('please check your password');
            };
        });

        //login
        $('.login').click(function (e) {
            e.preventDefault();
            var request = $.ajax({
                url: urls + "/ulogin",
                type: "POST",
                data: { account: $(".laccount").val(), password: $(".lpassword").val() },
                cache: false,
                async: false
            });
            request.done(function (data) {
                var ans = data.result;
                if (ans == 1) {
                    location.href = hostname + '/APP/' + pathname + "/selectAPP.html";
                } else {
                    alert(ans);
                };
                console.log(ans);
            });
            request.fail(function (data) {
                console.log(data);
            });
        });

        //forgot
        $('.forgot').click(function (e) {
            e.preventDefault();
            var request = $.ajax({
                url: urls + "/uforgot",
                type: "POST",
                data: { account: $(".faccount").val() },
                cache: false,
                async: false
            });
            request.done(function (data) {
                console.log(data.result);
                alert(data.message);
            });
            request.fail(function (data) {
                console.log(data);
            });
        });

        //newpassword
        $('.newpassword').click(function (e) {
            e.preventDefault();
            var request = $.ajax({
                url: urls + "/urepassword",
                type: "POST",
                data: { oldpass: QueryString.p, newpass: $('.rpassword').val() },
                cache: false,
                async: false
            });
            request.done(function (data) {
                console.log(data.result);
                alert(data.message);
            });
            request.fail(function (data) {
                console.log(data);
            });
        });

        //selectapp
        $('.selectapp').click(function (e) {
            var app = $(this).attr('class').split(' ');
            var x = app[1];
            opennew('./oauth/' + x, '', '600', '600');
        });


    })();
});