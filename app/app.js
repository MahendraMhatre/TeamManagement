'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.calendar']);




app.controller('CalController', function($scope, $http, $filter) {
    /* config object */

    $scope.freeHrsDate = {};
    $scope.displayTime;
    $http.get('users.json').success(function(data) {
        $scope.users = data;

    });

    $http.get('resource_event.json').success(function(data) {
        $scope.resource_event = data;
    });


    $scope.currentUser = function(selected) {
        $scope.display = selected;
    };

    var date = new Date();


    /* event source that contains custom events on the scope */
    $scope.events = [];

    $scope.uiConfig = {
        calendar:{
            height: 450,
            editable: true,
            header:{
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            eventClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender

        }
    };

    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };

    /* Change View */
    $scope.changeView = function(view,calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };

    /* Change View */
    $scope.renderCalender = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
            'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    /* event sources array*/

    $scope.eventSources = [$scope.events];

    $scope.user = {};


    $scope.addTask = function(selected) {

        $scope.user[selected.sys_id] = {};
        $scope.freeHrsDate[selected.sys_id] = {};
        $scope.events.splice(0,$scope.events.length);
        for(var i = 0; i < $scope.resource_event.result.length ; i++) {



            if($scope.resource_event.result[i].user.value == selected.sys_id) {

                $scope.startDate = $filter('date')($scope.resource_event.result[i].start_date_time, 'MM/dd/yyyy h:mm a');
                $scope.startTime = $filter('date')($scope.resource_event.result[i].start_date_time, 'h:mm');
                $scope.endDate = $filter('date')($scope.resource_event.result[i].end_date_time, 'MM/dd/yyyy');
                $scope.endDate1 = $filter('date')($scope.resource_event.result[i].end_date_time, 'MM/dd/yyyy h:mm a');
                $scope.endTime = $filter('date')($scope.resource_event.result[i].end_date_time, 'h:mm');

                $scope.startDate2 = $filter('date')($scope.resource_event.result[i].start_date_time, 'yyyy-MM-ddTHH:mm:ss');
                $scope.endDate2 = $filter('date')($scope.resource_event.result[i].end_date_time, 'yyyy-MM-ddTHH:mm:ss');

                $scope.events.push({
                    title: $scope.resource_event.result[i].type,
                    start:  $scope.startDate,
                    end: $scope.endDate1

                });

                if(typeof $scope.user[selected.sys_id][$scope.endDate] != 'undefined') {
                    if(typeof $scope.user[selected.sys_id][$scope.endDate].days != 'undefined') {
                        $scope.user[selected.sys_id][$scope.endDate].days.push($scope.startDate2, $scope.endDate2);
                    }
                    else {
                        $scope.user[selected.sys_id][$scope.endDate].days = [];
                        $scope.user[selected.sys_id][$scope.endDate].days.push($scope.startDate2, $scope.endDate2);
                    }
                }
                else {
                    $scope.user[selected.sys_id][$scope.endDate] = {};
                    $scope.user[selected.sys_id][$scope.endDate].days = [];
                    $scope.user[selected.sys_id][$scope.endDate].days.push($scope.startDate2, $scope.endDate2);

                }
            }

        }

        /* calculating busy time for each member */

        $scope.total = 0;

        $scope.freeHrs = [];


        $scope.calculateFreeHrs = function(d1, week , d2) {


            // var d3 = d2 +'T12:00:00';

            var d4 = d2 +'T12:00:00';
            console.log("calculte free hrs");
            console.log(moment(d1));
            console.log(d2);
            console.log(week);

            var start = moment(d1);

            var tempStart = d1;
            // make a fixed moment for last end time of the day;
            var fixedEnd = moment(d4);



            for(var i = 0; i < week.length; i += 2) {

                var end = moment(week[i]);
                if(start.hour() >= 12) {
                    start = moment(week[i + 1]);
                    break;
                }
                if(end.hour() > 12) {
                    break;
                }

                if(end.diff(start, 'minutes') > 0) {
                    $scope.freeHrs.push(start, end);
                    $scope.freeHrsDate[selected.sys_id][d2].push(tempStart, week[i]);
                }
                tempStart = week[i + 1];
                start = moment(week[i + 1]);
            }

            end = fixedEnd;
            if(end.diff(start, 'minutes') > 0) {
                $scope.freeHrs.push(start, end);
                $scope.freeHrsDate[selected.sys_id][d2].push(tempStart, d4);
            }


        };


        var start;
        var end;
        angular.forEach($scope.user[selected.sys_id], function(value, key) {
            console.log("for each");
            console.log($scope.user[selected.sys_id][key].days);
            $scope.demoDate = $filter('date')($scope.user[selected.sys_id][key].days[0], 'yyyy-MM-dd');
            $scope.demoDate1 = $filter('date')($scope.user[selected.sys_id][key].days[0], 'yyyy-MM-dd');
            $scope.demo = $scope.demoDate1;
            $scope.freeHrsDate[selected.sys_id][$scope.demoDate] = [];
            $scope.demoDate = $scope.demoDate + 'T08:00:00';

            console.log("Demo Date");
            console.log($scope.demoDate);
           /*considering the days array as sorted */
            $scope.user[selected.sys_id][key].days.sort(function(a,b){
                end = moment(a);
                start = moment(b);
                return end.diff(start, 'minutes');
            });

            console.log("sorted hours");
            console.log($scope.user[selected.sys_id][key].days);

            $scope.calculateFreeHrs($scope.demoDate, $scope.user[selected.sys_id][key].days, $scope.demoDate1);
            for(var i = 0; i < $scope.user[selected.sys_id][key].days.length - 1 ; i =i+2) {
                end = moment($scope.user[selected.sys_id][key].days[i+1]);
                start = moment($scope.user[selected.sys_id][key].days[i]);
                console.log(end.diff(start, 'minutes'));
                $scope.total = $scope.total + end.diff(start, 'minutes');
           }

            console.log("Free hours");
            console.log($scope.freeHrs);
            console.log("free hrs date");
            console.log($scope.freeHrsDate);


        });




    };

    $scope.repeatingTask = function() {
        console.log("in repeating tasks");
        angular.forEach($scope.freeHrsDate, function(value, key) {
            angular.forEach($scope.freeHrsDate[key], function(value1, index) {
                console.log($scope.freeHrsDate[key]);
                var times = value1;

            });

        });
    };


});