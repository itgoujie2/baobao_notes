var app = angular.module('baobao', ['ui.router'])


app.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('home', {
      url: '/', 
      templateUrl: 'views/home.html', 
      controller: 'HomeCtrl'
    })
    .state('note', {
      url: '/notes/{id}', 
      templateUrl: 'views/note.html', 
      controller: 'NoteCtrl'
    })

  $urlRouterProvider.otherwise('/');
});

app.controller('HomeCtrl', ['$scope', 'notes', function($scope, notes){

  $scope.notes = [];
  $scope.newNote = {};
  $scope.searchText = 'tes';

  notes.getAll().success(function(data){
    console.log('get all note: ' + JSON.stringify(data));
    $scope.notes = $scope.notes.concat(data);
  });

  $scope.addNote = function(){
    if (!$scope.newNote.title || $scope.newNote.title === ''){
      return;
    }
    console.log('newNote: ' + JSON.stringify($scope.newNote));
    notes.saveNote($scope.newNote).success(function(data){
      $scope.notes.unshift(data);
    });
    $scope.newNote = {};
  }

  $scope.searchFilter = function(){
    return function(item){
      var counter = countOcurrences(item.content, $scope.searchText);
      console.log('item: ' + JSON.stringify(item) + ' counter: ' + counter);
      if (counter > 0){
        return {
          title: item.title, 
          content: item.content, 
          highlight: true, 
          matches: counter
        }
      }
      else{
        return {
          title: item.title, 
          content: item.content, 
          highlight: false, 
          matches: 0
        }
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
      console.log('tracker: ' + tracker + ' item: ' + JSON.stringify(array[tracker]));
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

      console.log('tracker: ' + tracker + ' current result: ' + searchResult);

      if (tracker == array.length-1){
        $scope.notes = searchResult;
        console.log('searchResult: ' + searchResult);
        // $scope.$apply();
        return;
      }

      helper(++tracker, array);
    }
    helper(0, $scope.notes);
  }

  function countOcurrences(str, value){
     var regExp = new RegExp(value, "gi");
     return str && str.match(regExp) ? str.match(regExp).length : 0;  
  }
  
}]);

app.controller('NoteCtrl', function($scope, $stateParams, notes, comments){
  console.log('hitting NoteCtrl');
  console.log('note id: ' + $stateParams.id);
  $scope.thisNote = {};
  $scope.comments = comments.comments;
  $scope.newComment = {};
  $scope.note = notes.getNote($stateParams.id).success(function(data){
    $scope.thisNote = data;
    // comments.getAll($stateParams.id).success(function(data){
    //   console.log(JSON.stringify(data));
    //   $scope.comments = $scope.comments.concat(data);
    // });
  });

  $scope.updateNote = function(){
    notes.updateNote($scope.thisNote).success(function(data){
      $scope.thisNote = data;
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
      console.log('save success: ' + JSON.stringify(data));
      o.comments.unshift(data);
      return data;
    })
  }

  return o;
})