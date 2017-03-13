'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.calendar']);




app.controller('CalController', function($scope, $http, $filter) {
    /* config object */


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
    $scope.events = [
           ];

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
        console.log("in change");
        console.log(selected);


        $scope.user[selected.sys_id] = {}
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
        angular.forEach($scope.user[selected.sys_id], function(value, key) {
            console.log("for each");
            console.log($scope.user[selected.sys_id][key].days);
            var end = moment($scope.user[selected.sys_id][key].days[1]);
            var start = moment($scope.user[selected.sys_id][key].days[0]);
            console.log(end.diff(start, 'minutes'))
            $scope.total = $scope.total + end.diff(start, 'minutes');

        });



        console.log($scope.user);
    };


});