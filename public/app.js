var app = angular.module('baobao', ['ui.router'])


app.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('home', {
      url: '/', 
      templateUrl: 'views/home.html', 
      controller: 'HomeCtrl'
    })
    .state('note', {
      url: '/notes/{id}/{searchText}', 
      templateUrl: 'views/note.html', 
      controller: 'NoteCtrl'
    })

  $urlRouterProvider.otherwise('/');
});

app.controller('HomeCtrl', ['$scope', 'notes', function($scope, notes){

  $scope.notes = [];
  $scope.newNote = {};
  $scope.searchText = '';

  notes.getAll().success(function(data){
    // console.log('get all note: ' + JSON.stringify(data));
    $scope.notes = $scope.notes.concat(data);
  });

  $scope.addNote = function(){
    if (!$scope.newNote.title || $scope.newNote.title === ''){
      return;
    }
    // console.log('newNote: ' + JSON.stringify($scope.newNote));
    notes.saveNote($scope.newNote).success(function(data){
      $scope.notes.unshift(data);
    });
    $scope.newNote = {};
  }

  $scope.searchFilter = function(){
    return function(item){
      var counter = countOcurrences(item.content, $scope.searchText);
      // console.log('item: ' + JSON.stringify(item) + ' counter: ' + counter);
      if (counter > 0){
        console.log('calling 1');
        // return {
        //   title: item.title, 
        //   content: item.content, 
        //   highlight: true, 
        //   matches: counter
        // }

        item.matches = counter;
        return item
      }
      else{
        console.log('calling 2');
        // return {
        //   title: item.title, 
        //   content: item.content, 
        //   highlight: false, 
        //   matches: 0
        // }
        item.matches = 0;
        return item
      }

    }
  }

  $scope.searchInAll = function(){
    var searchResult = []
    // $scope.notes.forEach(function(current, index, array){
    //   console.log(current.title + ' : ' + current.content + ' : ' + countOcurrences(current.content, $scope.searchText));
    //   var counter = countOcurrences(current.content, $scope.searchText);
    //   if (counter > 0){
    //     searchResult.concat({
    //       title: current.title, 
    //       content: current.content, 
    //       highlight: true, 
    //       matches: counter
    //     })
    //   }
    //   else{
    //     searchResult.concat({
    //       title: current.title, 
    //       content: current.content, 
    //       highlight: false, 
    //       matches: 0
    //     })  
    //   }

    //   if (index == array.length-1){
    //     $scope.notes = searchResult;
    //     console.log('searchResult: ' + searchResult);
    //     // $scope.$apply();
    //   }
    // })

    function helper(tracker, array){
      // console.log('tracker: ' + tracker + ' item: ' + JSON.stringify(array[tracker]));

      if (array[tracker] && array[tracker].content){
        var counter = countOcurrences(array[tracker].content, $scope.searchText);
        if (counter > 0){
          searchResult = searchResult.concat({
            title: array[tracker].title, 
            content: array[tracker].content, 
            highlight: true, 
            matches: counter
          })
        }
        else{
          searchResult = searchResult.concat({
            title: array[tracker].title, 
            content: array[tracker].content, 
            highlight: false, 
            matches: 0
          })  
        }  
      }
      

      // console.log('tracker: ' + tracker + ' current result: ' + JSON.stringify(searchResult));

      if (tracker == array.length-1){
        $scope.notes = searchResult;
        // console.log('searchResult: ' + JSON.stringify(searchResult));
        // $scope.$apply();
        return;
      }

      helper(++tracker, array);
    }
    helper(0, $scope.notes);
  }

  function countOcurrences(str, value){
     var regExp = new RegExp(value, "gi");
     return value && str && str.match(regExp) ? str.match(regExp).length : 0;  
  }
  
}]);

app.controller('NoteCtrl', function($scope, $stateParams, $state, notes, comments){
  // console.log('hitting NoteCtrl');
  // console.log('note id: ' + $stateParams.id);
  // console.log('search text: ' + $stateParams.searchText);
  $scope.thisNote = {};
  $scope.comments = comments.comments;
  $scope.newComment = {};
  $scope.switch = false;
  $scope.note = notes.getNote($stateParams.id).success(function(data){
    $scope.thisNote = data;
    // comments.getAll($stateParams.id).success(function(data){
    //   console.log(JSON.stringify(data));
    //   $scope.comments = $scope.comments.concat(data);
    // }); 
    
    setTimeout(function(){
      $('#noteContent').removeHighlight().highlight($stateParams.searchText);  
    }, 0)
    
    
  });

  $scope.switchNoteArea = function(){
    $scope.switch = true;
    scrollToBottom();
  }

  function scrollToBottom() {
    console.log('called ' + JSON.stringify($('#textbox')));
    $('#textbox').scrollTop($('#textbox')[0].scrollHeight);
  }  

  $scope.updateNote = function(){

    notes.updateNote($scope.thisNote).success(function(data){
      $scope.thisNote = data;
      $scope.switch = false;
      // console.log('this note after update: ' + JSON.stringify($scope.thisNote));
    })
  }

  $scope.addComment = function(noteId){
    if (!$scope.newComment.content || $scope.newComment.content === ''){
      return;
    }

    $scope.newComment.parent = noteId;
    
    comments.saveComment($scope.newComment).success(function(data){
      $scope.comments.unshift(data);
      $scope.newComment = {};
    })
  }

  $scope.goBack = function(){
    $state.go('home');
  }
});

app.factory('notes', function($http){

	var o = {
    notes: []
	}

  o.getAll = function(){
    return $http.get('/notes').success(function(data){
      if (data){
        return data;  
      }
      else{
        return o.notes;
      }
    })
  }

  o.saveNote = function(note){
    return $http.post('/notes', note).success(function(data){
      console.log('save success: ' + JSON.stringify(data));
      o.notes.unshift(data);
      return data;
    })
  }

  o.updateNote = function(note){
    return $http.post('/notes/update', note).success(function(data){
      return data;
    })
  }

  o.getNote = function(noteId){
    return $http.get('/notes/' + noteId).success(function(data){
      return data;
    })
  }

	return o;
})

app.factory('comments', function($http){

  var o = {
    comments: []
  }

  o.getAll = function(noteId){
    return $http.get('/comments?noteId=' + noteId).success(function(data){
      return data;
    })
  }

  o.saveComment = function(comment){
    return $http.post('/comments', comment).success(function(data){
      
      o.comments.unshift(data);
      return data;
    })
  }

  return o;
})