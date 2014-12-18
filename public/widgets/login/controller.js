Kamato.register.controller('loginCtrl', function ($scope, $http, $location) {
    $scope.searchObject = null;
    $scope.init = function () {
        $scope.searchObject = $location.search();
        if ($scope.searchObject.a && $scope.searchObject.p) {
            $('.box').removeClass('active');
            $('#box-register').addClass('active');
            $('.raccount').hide();
            $('#box-register h2').text('Change New Password');
            $('.register').text('Change New Password');
            $('.register').addClass('newpassword');
            $('.register').removeClass('register');
        };

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
        };

    };
    $scope.login = function () {
        var request = $.ajax({
            url: "/login",
            type: "POST",
            data: { account: $(".laccount").val(), password: $(".lpassword").val() },
            cache: false,
            async: false
        });
        request.done(function (data) {
            console.log(data.result);
            if (data.result == 1) {
                $location.path('/platform/APP');
            } else {
                alert('account or password wrong');
            };
        });
        request.fail(function (data) {
            console.log(data);
        });
    };
    $scope.active = function () {
        if (angular.element('.register').hasClass('register')) {
            if ($('.rpassword').val() == $('.rpassword2').val()) {
                var request = $.ajax({
                    url: "/regist",
                    type: "POST",
                    data: { account: $(".raccount").val(), password: $(".rpassword").val() },
                    cache: false,
                    async: false
                });
                request.done(function (data) {
                    console.log(data.result);
                    if (data.result == 1) {
                        $location.path('/platform/APP');
                    } else {
                        alert('wrong');
                    };
                });
                request.fail(function (data) {
                    console.log(data);
                });
            } else {
                alert('please check your password');
            };
        } else {
            var request = $.ajax({
                url: "/repassword",
                type: "POST",
                data: { oldpass: $scope.searchObject.p, newpass: $('.rpassword').val() },
                cache: false,
                async: false
            });
            request.done(function (data) {
                console.log(data.result);
                if (data.result == 1) {
                    $location.path('/platform/login');
                } else {
                    alert('wrong');
                };
            });
            request.fail(function (data) {
                console.log(data);
            });
        };
    };
    $scope.forgot = function () {
        var request = $.ajax({
            url: "/forgot",
            type: "POST",
            data: { account: $(".faccount").val() },
            cache: false,
            async: false
        });
        request.done(function (data) {
            console.log(data.result);
            alert('please go to watch your email');
        });
        request.fail(function (data) {
            console.log(data);
        });
    };
});