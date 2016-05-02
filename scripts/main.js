var React = require('react');
var ReactDOM = require('react-dom');
var RadioGroup = require('react-radio-group');

var Router = require('react-router').Router;
var Route = require('react-router').Route;
var Link = require('react-router').Link;

//Clean up urls with history
var createBrowserHistory = require('history/lib/createBrowserHistory');

// For linking nested states with 2-way binding
var Catalyst = require('react-catalyst');


//Rebase for Firebase
// var Firebase = require('firebase');
// var Rebase = require('re-base');
// var base = Rebase.createClass('https://daily-to-do.firebaseio.com/');

//helpers
var h = {
	todayDate : function(){
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var date = new Date();
		var day = date.getDate();
		var month = date.getMonth();
		var year = date.getFullYear();
		var class1 = "";

		if(months[month] == 'May' || months[month] == 'August' || months[month] == 'September'){
			class1="alt-month";
		} else if (months[month] == 'April') {
			class1="alt-month2";
		}

		return (
			<div className='date-container'>
				<span className="day">{day} </span><span className="month">{months[month].substr(0,3)} </span><span className={class1 + " year"}>{year}</span>
			</div>
		)
	}
};


// Main app
var App = React.createClass({
	mixins : [Catalyst.LinkedStateMixin],
	//Get the initial state of the app
	getInitialState : function(){
		return { 
			list : {},
			checked : false
		}
	},

	componentDidMount : function(){
		// base.syncState('item', {
		// 	context: this,
		// 	state : 'list'

		// });

		var localStorageRef = localStorage.getItem('item');

		if(localStorageRef){
			//update component state to reflect localStorage
			this.setState({
				order : JSON.parse(localStorageRef)
			})
		}
	},

	componentWillUpdate : function(nextProps, nextState){
		//Saves updates to your local storage so it keeps data on refresh
		localStorage.setItem(this.props.list, JSON.stringify(nextState.list))
	},

	componentDidUpdate : function(prevProps, prevState){

			var listItems = [];
			var listItem = document.getElementsByTagName('li');
			var number = "";
			var num = listItem.length;

			for(var i = 0 ; i < listItem.length; i++){
				// console.log(listItem[i].getAttribute('class'));
				// if(listItem[i].classList.contains('High')){
				// 	console.log('high');
				// }
				// if(listItem[i].getAttribute('class')==='High'){
				// 	console.log('high');
				// }
				
				listItems.push(listItem[i]);
				// console.log(listItems);

				var sort = listItems.sort(function(a, b){
					return a.getAttribute('class') > b.getAttribute('class')
					});

				setTimeout(function(){
					return document.getElementsByTagName('ul').innerHTML = sort;
				}, 500)
				
				
				for(var i = 0; i < listItems.length; i++){
				}
			}
	},

	//METHOD: When the state changes, update it via setState and create a unique identifier with the timestamp
	addItem : function(newItem, completeItem){
		//Add unique key to each to do item
		var timestamp = (new Date()).getTime();

		//update state object
		this.state.list['list-' + timestamp] = newItem;
		newItem['status'] = "incomplete";

		//set state object
		this.setState({ list : this.state.list});
	},

	updateStatus : function(completeItem){
		this.setState({ list : this.state.list});
	},

	updateRadio : function(radioStatus){
		console.log(radioStatus);
			alert(this.state.checked);
			this.setState({ checked : this.state.checked });
	},

	removeItem : function(key){
		 if(confirm('Are you sure you want to delete this item?')){

			delete this.state.list[key]; //deletes item

			this.setState({list : this.state.list });
		 }
	},

	renderItem : function(key){
		return (
			<ListItem key={key} index={key} details={this.state.list[key]} updateStatus={this.updateStatus} removeItem={this.removeItem} />
		)
	},

	render : function(){
		return(

			<div className="container">
				<div className="app-container--image"></div>
				<div className="app-container grid pad-large">
					<h1>{h.todayDate()}</h1>
					<h1 className="tagline">Do. Doing. Done</h1>
					{/*Add props to form to pass it from the app to the form */}
					<Form addItem={this.addItem} updateRadio={this.updateRadio} deets={this.state.checked}/>
					
					{/*Loop over each to do item using the map method - grab a list of all keys and for each key it runs against this.renderItem */}
					<ul className="clearfix">
						{Object.keys(this.state.list).map(this.renderItem)}
					</ul>
				</div>
			</div>
		)
	}
});

var Form = React.createClass({

	// radioStatus : function(e){
	// 	var input = e.target.value;

	// 	this.props.updateRadio(input);
	// },

	newItem : function(e){
		e.preventDefault();

		//get data from form and create an object
		var data = {
			item : this.refs.item.value,
			high: this.refs.high.checked,
			medium: this.refs.medium.checked,
			low: this.refs.low.checked,
		}
		
		if(data.item === ''){
			alert('Oops! Looks like you haven\'t provided a to do item')
		} else if(data.high === false && data.medium === false && data.low === false) {
			alert('Oops! Looks like you forgot to indicate your priority.')
		} else {
			//add Item to App state
			this.props.addItem(data);
			this.refs.postForm.reset();
		}
	},

	render : function(){
		return (
			<form className="form-wrapper" ref="postForm" onSubmit={this.newItem}>
				<input type="text" placeholder="add to do item" status="incomplete" ref="item" className="add-input"/>
				<div className="input-secondary">
					<label className="checkbox-item">High 
						<input ref="high" key="high" type="checkbox" unchecked value="high" />
					</label>
					<label className="checkbox-item">Medium 
						<input ref="medium" key="medium" type="checkbox"unchecked value="medium"/>
					</label>
					<label className="checkbox-item">Low 
						<input ref="low" key="low" type="checkbox" unchecked value="low"/>
					</label>
					<button className="button button-submit" type="submit">Add Item</button>
				</div>	
			</form>
		)
	}
});

var ListItem = React.createClass({
	completeItem : function(e){
		e.preventDefault();

		// OnClick change status to complete
		var newStatus = this.props.details.status = 'complete';
		
		this.props.updateStatus(this.props.index);
	},

	deleteItem : function(e){
		e.preventDefault();

		this.props.removeItem(this.props.index);
	},

	render : function(){

		var priorityName = "";

		priorityName = this.props.details.high === true ?
			"High" : this.props.details.medium === true ?
			priorityName="Medium" : this.props.details.low === true ?
			priorityName="Low" : null

		return (
			<li className={priorityName + " " + this.props.details.status + ' list-wrapper g-lg-1-4'}>
				<div className="list-container">
					<p className={priorityName + ' priority-type'}>{priorityName} Priority</p>
					<a className="check-link" href="" onClick={this.completeItem}>
						<svg className={this.props.details.status + " svg-check"}>
							<use xlinkHref='/svg/svgbuild/svg.svg#icon_check'></use>
						</svg>
					</a>
					<div className="body-wrapper">
						<p className={priorityName + " todo-text prl-30"}>{this.props.details.item}</p>
						<a className={priorityName + " button button-list remove"} href="" onClick={this.deleteItem}>Remove</a>
					</div>
				</div>
			</li>
					
		)
	}
})

//404 Page
var Error = React.createClass({

	render : function(){
		return (
			<h1>Awwww, shucks! Looks like that page does not exist</h1>
		)
	}
})

//Set up Routes using React Router
var routes = (
	<Router history={createBrowserHistory()}>
		<Route path="/" component={App}/>
		<Route path="*" component={Error}/>
	</Router>
)



ReactDOM.render( routes, document.getElementById('main') );