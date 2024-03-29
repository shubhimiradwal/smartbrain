import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from'clarifai';
import Signin from './components/Signin/signin';
import Register from './components/Register/register';
import './App.css';
import FaceRecognition from './components/FaceRecognition/facerecognition';
import Navigation from './components/Navigation/navigation';
import Logo from './components/Logo/logo';
import ImageLinkForm from './components/ImageLinkForm/imagelinkform';
import Rank from './components/Rank/rank';

const app = new Clarifai.App({
 apiKey: 'fb543b9fc3bf4299958a2ca4121a891d'
});

const particlesOptions = 
  {
                particles: {
                  number: {
                    value: 80,
                    density: {
                      enable: true,
                      value_area: 800
                    }
                  }
                }
              }

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user:{
        id:'',
        name:'',
        email:'',
        entries: 0,
        joined: ''
      }
    }
  }

loadUser = (data) => {
  this.setState({user:{
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
  }
  })
}


  calculateFaceLocation = (data) =>{
  	const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  	const image = document.getElementById('inputimage');
  	const width = Number(image.width);
  	const height = Number(image.height);
  	return{
  		leftCol: clarifaiFace.left_col * width,
  		topRow: clarifaiFace.top_row * height,
  		rightCol: width-(clarifaiFace.right_col * width),
  		bottomRow:height-(clarifaiFace.bottom_row *  height),

  		  	}

  }

  displayFaceBox=(box) =>{
  	this.setState({box: box})
  	console.log(box);
  }

  onInputChange = (event) =>{
    this.setState({ input: event.target.value });
}

onButtonSubmit = () =>{
  this.setState({ imageUrl : this.state.input })
  
  app.models
          .predict(
                Clarifai.FACE_DETECT_MODEL ,
                this.state.input)
            .then(response =>{
              if(response){
                fetch('http://localhost:3001/image',{
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      id:this.state.user.id
                     })
                  })
                .then(response => response.json())
                .then(count =>{
                  this.setState(Object.assign(this.state.user,{ entries: count}))
                })
            }
              
            this.displayFaceBox(this.calculateFaceLocation(response)) 
             
            })
  	        .catch(err => console.log(err)) 
}

onRouteChange= (route) =>{
	if(route === 'signout'){
		this.setState({isSignedIn: false});
	} else if(route === 'home'){
		this.setState({isSignedIn: true});
	}

	this.setState({route: route});
	}


  render() {
    return (
      <div className="App">
         <Particles className= 'particles'
              params={particlesOptions}
            />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange ={this.onRouteChange}/>
        {	
        	this.state.route === 'home'
        	    ?<div>
	                <Logo />
	                <Rank name = {this.state.user.name} entries={ this.state.user.entries } />
	                <ImageLinkForm onInputChange= { this.onInputChange } onButtonSubmit= { this.onButtonSubmit }/>
	      			<FaceRecognition box ={ this.state.box } imageUrl = { this.state.imageUrl }/>
	             </div> 
        	    :( this.state.route === 'register'
        	    	? <Register  loadUser= {this.loadUser} onRouteChange= { this.onRouteChange}/>
        	    	:<Signin  loadUser={ this.loadUser} onRouteChange= { this.onRouteChange}/>	
        	    	)
        	    
                
             }
             </div>
    );
  }
}

export default App;
