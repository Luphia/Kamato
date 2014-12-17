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