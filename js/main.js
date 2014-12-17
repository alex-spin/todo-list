$(function() {
	// пространство имён
	window.App = {
		Models: {},
		Collections: {},
		Views:{}
	};

	// шаблон
	window.template = function(id) {
		return _.template( $('#' + id).html() );
	};

	// task model
	App.Models.Task = Backbone.Model.extend({
		validate: function (attrs) {
			if ( ! $.trim(attrs.title) ) {
				return 'Имя задачи должно быть валидным!';
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
			var template = this.template(this.model.toJSON());
			this.$el.html( template );
			return this;
		},
		events: {
			'click .edit': 'editTask',
			'click .delete': 'destroy'
		},
		editTask: function  () {
			var newTaskTitle = prompt('Как переименуем задачу?', this.model.get('title'));
			this.model.set('title', newTaskTitle, {validate: true});
		},
		remove: function  () {
			this.$el.remove();
		},
		destroy: function  () {
			this.model.destroy();
		}
	});

	App.Views.AddTask = Backbone.View.extend({
		el: '#addTask',
		events: {
			'submit' : 'submit'
		},
		initialize: function() {
		},
		submit: function(e) {
			e.preventDefault();
			var newTaskTitle =  $(e.currentTarget).find('input[type=text]').val();
			var newTask = new App.Models.Task({ title: newTaskTitle });
			this.collection.add(newTask);
		}
	});

	App.Collections.Task = Backbone.Collection.extend({
		model: App.Models.Task
	});

	App.Views.Tasks = Backbone.View.extend({
		tagName: 'ul',
		render: function() {
			this.collection.each(this.addOne, this);
			return this;
		},
		initialize: function() {
			this.collection.on('add', this.addOne, this );
		},
		addOne: function(task) {
			// создавать новый дочерний вид
			var taskView = new App.Views.Task({ model: task });
			// добавлять его в корневой элемент
			this.$el.append(taskView.render().el);
		}
	});

	window.tasksCollection = new App.Collections.Task([
		{
			title: 'Сходить в магазин'
		},
		{
			title: 'Получить почту'
		},
		{
			title: 'Сходить на работу'
		}
	]);

	var tasksView = new App.Views.Tasks({ collection: tasksCollection});
	var addTaskView = new App.Views.AddTask({ collection: tasksCollection });

	$('.tasks').html(tasksView.render().el);

});