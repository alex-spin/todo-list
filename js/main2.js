$(function() {
	// namespace
	window.App = {
		Models: {},
		Collections: {},
		Views:{}
	};

	// template
	window.template = function(id) {
		return _.template( $('#' + id).html() );
	};

	// task model
	App.Models.Task = Backbone.Model.extend({
		defaults: function() {
			return {
				title: "empty todo...",
				status: 'new'
			}},
		validate: function (attrs) {
			if ( ! $.trim(attrs.title) ) {
				return 'Task name is invalid!';
			}
		}
	});
	// task view
	App.Views.Task = Backbone.View.extend({
		initialize: function () {
			this.model.on('change', this.render, this);
			this.model.on('destroy', this.remove, this);
		},
		tagName: 'li',
		template: template('taskTemplate'),
		render: function () {

			var template = this.template(this.model.toJSON()),
				modelId = this.model.id,
				parentItems = this.model.get('childList'),
				childItem = this.model.get('parent');

			if (parentItems) {
				this.$el.html(template);
				this.$el.attr('data-model', modelId);
			} else if (childItem) {
				var parent = $('.tasks li[data-model="' + childItem + '"]');
				var template = this.template(this.model.toJSON());
				this.$el.html('<li class="sub-items">' + template + '</li>');

			} else {
				this.$el.html(template);
				this.$el.attr('data-model', modelId);
			}

			if (this.model.get('status', 'complete') == 'complete') {
				this.$el.addClass('task-complete');
			}

			return this;
		},
		events: {
			'dblclick ': 'editTask',
			'click .delete': 'destroy',
			'click .complete': 'complete',
			'click .sub-task': 'subTaskAddClick'
		},
		editTask: function  () {
			var newTaskTitle = prompt('Как переименуем задачу?', this.model.get('title'));
			this.model.set('title', newTaskTitle, {validate: true});
			//this.model.save('title', newTaskTitle, {validate: true});
		},
		remove: function  () {
			this.$el.remove();
		},
		destroy: function  () {
			this.model.destroy();
		},
		complete: function () {
			this.model.set('status', 'complete');
			//this.model.save('status', 'complete');
			this.$el.addClass('task-complete');
		},
		subTaskAddClick: function () {
			this.$el.addClass('parent');
		}
	});
	// add new task
	App.Views.AddTask = Backbone.View.extend({
		el: '#addTask',
		events: {
			'submit' : 'submit',
			'keyup .search' : 'search'
		},
		submit: function(e) {
			e.preventDefault();
			var newTaskTitle =  $(e.currentTarget).find('input[type=text]').val();
			if ( $.trim(newTaskTitle) ) {
				this.collection.add([{ title: newTaskTitle, status: 'new'}]);
			}
		},
		search: function(e){
			var filterText = this.$('.search').val().toLowerCase(),
				results = this.collection.filter(function(taskSearch) {
					return taskSearch.get('title').indexOf(filterText)>-1;
				});
			tasksView.renderFiltered(results);
		}
	});

	App.Collections.Task = Backbone.Firebase.Collection.extend({
		model: App.Models.Task,
		url: 'https://scorching-inferno-4881.firebaseio.com/todos'
	});

	// collection view
	App.Views.Tasks = Backbone.View.extend({
		tagName: 'ul',
		render: function(params) {
			if (!params) {
				this.collection.each(this.addOne, this);
			} else {
				var choiceM = this.collection.where({'status': params});
				if (choiceM.length !== 0) {
					var self = this;
					this.$el.html('');
					$.each(choiceM, function (){
						self.addOne(this);
					});
				}
			}
			return this;
		},
		renderFiltered: function(filtered) {
			if (filtered.length) {
				var self = this;
				this.$el.html('');
				$.each(filtered, function (){
					self.addOne(this);
				});
			}
			return this;
		},
		initialize: function() {
			this.changeCount();
			//this.collection.fetch();
			this.collection.on('add', this.addOne, this );
			this.collection.on('all', this.changeCount, this );
		},
		events: {
			'click .sub-task': 'subTaskAdd'
		},
		addOne: function(task) {
			// create new child
			var taskView = new App.Views.Task({ model: task });
			//taskView.model.save();
			// add child to list
			this.$el.append(taskView.render().el);
		},
		changeCount: function(countAll, countActive, countCompleted) {
			countAll = this.collection.length;
			countActive = (this.collection.where({'status': 'new'})).length;
			countCompleted = (this.collection.where({'status': 'complete'})).length;
			$('.show-all-count span').text(countAll);
			$('.show-active-count span').text(countActive);
			$('.show-completed-count span').text(countCompleted);
		},
		subTaskAdd: function () {
			var parentItem = this.$el.find('li.parent'),
				parentItemId = parentItem.attr('data-model'),
				parentModel = this.collection.get(parentItemId),
				childList = [],
				newTaskTitle = prompt('Новая подзадача');

			parentItem.removeClass('parent');
			// add new model
			if ( $.trim(newTaskTitle) ) {
				this.collection.add({ title: newTaskTitle, status: 'new', 'parent': parentItemId});
			}

			var temp = parentModel.get('childList');
			var childModel = this.collection.at(this.collection.length-1),
				childId = childModel.id;

			// add id of sub item to child array in parent
			if (temp) {
				childList.push(childId);
				parentModel.set('childList',childList);
			} else {
				childList[0] = childId;
				parentModel.set('childList',childList);
			}
		}
	});


	// navigation for task
	App.Views.NavTask = Backbone.View.extend({
		el: '.nav-task',
		events: {
			'click .show-completed' : 'showCompleted',
			'click .show-active' : 'showActive',
			'click .show-all' : 'showAll'
		},
		initialize: function() {
		},
		showCompleted: function() {
			tasksView.render('complete');
		},
		showActive: function() {
			tasksView.render('new');
		},
		showAll: function() {
			tasksView.$el.html('');
			tasksView.render();
		}
	});

	window.tasksCollection = new App.Collections.Task();

	var tasksView = new App.Views.Tasks({ collection: tasksCollection});
	var addTaskView = new App.Views.AddTask({ collection: tasksCollection });
	var navView = new App.Views.NavTask({ collection: tasksCollection });

	 $('.tasks').html(tasksView.render().el);

});