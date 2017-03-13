'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.calendar']);

app.controller("myController", function($scope, $http) {
    $scope.display = "Hello";

    $http.get('users.json').success(function(data) {
      $scope.users = data;
    });

  $http.get('resource_event.json').success(function(data) {
    $scope.resource_event = data;
  });




});


app.controller('CalController', function($scope, $http, $filter) {
    /* config object */

    $scope.display = "Hello";

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
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


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

    $scope.addTask = function(selected) {
        console.log("in change");
        console.log(selected);


        $scope.events.splice(0,$scope.events.length);
        for(var i = 0; i < $scope.resource_event.result.length ; i++) {

            if($scope.resource_event.result[i].user.value == selected.sys_id) {

                $scope.startDate = $filter('date')($scope.resource_event.result[i].start_date_time, 'MM/dd/yyyy h:mm a');
                $scope.startTime = $filter('date')($scope.resource_event.result[i].start_date_time, 'h:mm');
                $scope.endDate = $filter('date')($scope.resource_event.result[i].end_date_time, 'MM/dd/yyyy');
                $scope.endTime = $filter('date')($scope.resource_event.result[i].end_date_time, 'h:mm');
                $scope.events.push({
                    title: $scope.resource_event.result[i].type,
                    start:  $scope.startDate,

                });


            }
        }


    };


});