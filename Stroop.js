define(['pipAPI'], function(APIconstructor) {

    var API     = new APIconstructor();
    var current = API.getCurrent();

    var answers     = ['i', 'e']; // answers[0] = blue | answers[1] = red 

 	API.addCurrent({
 	    answers      : answers,
        instructions: {
            inst_welcome :  '<p>Welcome to the experiment!</p></br>'+
                            '<p>We will show you items, one after the other.</p>'+
                            '<p>Your task is to indicate the color of each item.</p></br>'+
                            '<p>If the color of the item is <span style="color:blue">blue</span>, hit the <b>i</b> key with your right hand.</p>'+
                            '<p>If the color of the item is <span style="color:red">red</span>, hit the <b>e</b> key with your left hand.</p></br>'+
                            '<p>Please put your fingers on the keyboard to get ready</p></br>'+
                            '<p>Press SPACE to start a short practice</p>',
            inst_start   : '<p>The practice has now ended.</p></br>'+

                            '<p>Remember: indicate the color of the item.</p></br>'+
                            
                            '<p>If the color of the item is <span style="color:blue">blue</span>, hit the <b>i</b> key with your right hand.</p>'+
                            '<p>If the color of the item is <span style="color:red">red</span>, hit the <b>e</b> key with your left hand.</p></br>'+
                            
                            '<p>Please put your fingers on the keyboard to get ready</p></br>'+
                            
                            '<p>Press SPACE to continue</p>',

            inst_bye     : '<p>This is the end of the experiment</p>'+ 
                           '<p>Thank you for your participation</p>'+
                           '<p>To end please press SPACE</p>'
        },
        durations: {
            fixation : 1000,
            stimulus : 500,
            response : 1000,
            feedback : 1000,
            iti      : 1000
        },
        
	}); 
    
    

    API.addSettings('canvas',{
        textSize         : 5,
        maxWidth         : 1200,
        proportions      : 0.65,
        borderWidth      : 0.4,
        background       : '#ffffff',
        canvasBackground : '#ffffff'	
    });


    /***********************************************
    // Stimuli
     ***********************************************/

    API.addStimulusSets({
        defaultStim    : [{css:{color:'black', 'font-size':'100px'}}],
        fixation       : [{inherit:'defaultStim', media: '+'}],
        error          : [{inherit:'defaultStim', media: 'Wrong answer!'}],
        correct        : [{inherit:'defaultStim', media: 'Correct answer!'}],
        timeoutmessage : [{inherit:'defaultStim', media: 'Respond faster!'}]
    });


    API.addStimulusSets({
        inst_welcome : [{media: {html: current.instructions.inst_welcome}}],
        inst_start   : [{media: {html: current.instructions.inst_start}}],
        inst_bye     : [{media: {html: current.instructions.inst_bye}}]
    });

    /***********************************************
    // INSTRUCTIONS TRIAL
     ***********************************************/    



    API.addTrialSets('insts',{
        input: [ 
            {handle:'space',on:'space'} 
        ],
        interactions: [
            { 
                conditions: [{type:'inputEquals',value:'space'}], 
                actions: [
                    {type:'log'}, 
                    {type:'endTrial'}				
                ]
            }
        ]
    });
    
    
    API.addTrialSets('inst_welcome',{
        inherit:'insts',
	    layout: [
	        {media: {html: current.instructions.inst_welcome}}
        ]
    });

    API.addTrialSets('inst_start',{
        inherit:'insts',
	    layout: [
	        {media: {html: current.instructions.inst_start}}
        ]
    });

    API.addTrialSets('inst_bye',{
        inherit:'insts',
	    layout: [
	        {media: {html: current.instructions.inst_bye}}
        ]
    });

    /***********************************************
    // Main trials
     ***********************************************/

    API.addTrialSets('stimulus_trial',[{ 
        interactions: [
            { 
                conditions: [{type:'begin'}],
                actions: [
                    {type:'showStim', handle:'fixation'},
                    {type:'trigger', handle:'showTarget', duration: '<%= current.durations.fixation %>'}
                ]
            }, 

            {
                conditions:[{type:'inputEquals',value:'showTarget'}],
                actions: [
                    {type:'hideStim', handle:'fixation'}, 
				    {type:'setInput', input:{handle:current.answers[0], on: 'keypressed', key: current.answers[0]}},
				    {type:'setInput', input:{handle:current.answers[1], on: 'keypressed', key: current.answers[1]}},
				    {type:'showStim', handle: 'target'},
                    {type:'resetTimer'},
                    {type:'trigger',handle:'targetOut', duration: '<%= current.durations.stimulus %>'}
                ]
            },
            {
                conditions: [{type:'inputEquals', value:'targetOut'}], 
                actions: [
                    {type:'hideStim', handle:'target'}, 
                    {type:'trigger', handle:'timeout', duration: '<%= current.durations.response %>'}
                ]
            }, 	

            { 
                conditions: [{type:'inputEqualsStim', property:'correct'}], 
                actions: [
                    {type:'removeInput',handle:['All']},
                    {type:'setTrialAttr', setter:{score:1}},
                    {type:'log'},
                    {type:'hideStim', handle:['All']},
                    {type:'trigger', handle:'ITI'}
                ]
            }, 
            {
                conditions: [
                    {type:'inputEqualsStim', property:'correct'}, 
                    {type:'trialEquals', property:'block', value:'practice'}
                ],
                actions: [
                    {type:'showStim', handle:'correct'},
                    {type:'trigger', handle:'clean',duration: '<%= current.durations.feedback %>'}
                ]
            }, 
            {
                conditions: [
                    {type:'inputEquals', value:current.answers}, 
                    {type:'inputEqualsStim', property:'correct', negate:true}
                ],
                actions: [
                    {type:'removeInput', handle:['All']},
                    {type:'setTrialAttr', setter:{score:0}},
                    {type:'log'},
                    {type:'hideStim', handle:['All']},
                    {type:'trigger', handle:'ITI'}
                ]
            }, 
            {
                conditions: [
                    {type:'inputEquals', value:current.answers}, 
                    {type:'inputEqualsStim', property:'correct', negate:true},
                    {type:'trialEquals', property:'block', value:'practice'}
                ],
                actions: [
                    {type:'showStim', handle:'error'},
                    {type:'trigger', handle:'clean',duration: '<%= current.durations.feedback %>'}

                ]
            }, 
            {
                conditions: [
                    {type:'inputEquals',value:'timeout'}],
                actions: [
                    {type:'removeInput', handle:['All']},
                    {type:'setTrialAttr', setter:{score:-1}},
                    {type:'log'},					
                    {type:'trigger', handle:'ITI'}
                ]
            }, 
            {
                conditions: [
                    {type:'inputEquals',value:'timeout'}, 
                    {type:'trialEquals', property:'block', value:'practice'}
                ],
                actions: [
                    {type:'showStim', handle:'timeoutmessage'},
                    {type:'trigger', handle:'clean',duration: '<%= current.durations.feedback %>'}
                ]
            }, 
            {
                conditions: [{type:'inputEquals', value:'clean'}],
                actions:[
                    {type:'hideStim', handle:['All']}
                ]
            },

            {
                conditions: [{type:'inputEquals', value:'ITI'}],
                actions:[
                    {type:'removeInput', handle:['All']},
                    {type:'trigger', handle:'end', duration:'<%= trialData.block==="practice" ? current.durations.feedback+current.durations.iti : current.durations.iti %>'}
                ]
            },
            {
                conditions: [{type:'inputEquals', value:'end'}],
                actions: [{type:'endTrial'}]
            }
        ],
        stimuli : [
            {inherit:'error'},
            {inherit:'correct'},
            {inherit:'timeoutmessage'},
            {inherit:'fixation'},
            {media: '<%= trialData.text %>', css:{fontSize: '100px', color:'<%= trialData.color %>'}, handle:'target', data:{correct:'<%= trialData.correct %>'}}
        ]
    }]);

    /***********************************************
    // Stimuli
     ***********************************************/

    
    
    API.addTrialSet('cong', [
        {inherit: 'stimulus_trial', data: {text: 'BLUE', color: 'blue', correct:current.answers[0]}},
        {inherit: 'stimulus_trial', data: {text: 'RED', color: 'red', correct:current.answers[1]}}
    ]);
    
    API.addTrialSet('incong', [
        {inherit: 'stimulus_trial', data: {text: 'BLUE', color: 'red', correct:current.answers[1]}},
        {inherit: 'stimulus_trial', data: {text: 'RED', color: 'blue', correct:current.answers[0]}}
    ]);
    
    API.addTrialSet('neu', [
        {inherit: 'stimulus_trial', data: {text: 'XXXX', color: 'blue', correct:current.answers[0]}},
        {inherit: 'stimulus_trial', data: {text: 'XXXX', color: 'red', correct:current.answers[1]}}
    
    ]);
    /***********************************************
    // Sequence
     ***********************************************/

	API.addSequence([
	    {
		    inherit : {set:"inst_welcome"}
	    },
	    {
			mixer: 'random',
			data: [
				{   
					mixer: 'repeat',
					times: 1,
					data: [
                        {inherit:{set:'cong', type:'equalDistribution', n: 4, seed: 'congP'}, data:{block: 'practice'}}
					]
				},
				{
				    
					mixer: 'repeat',
					times: 1,
					data: [
                        {inherit:{set:'incong', type:'equalDistribution', n: 4, seed: 'incongP'}, data:{block: 'practice'}}
					]
				},
				{
					mixer: 'repeat',
					times: 1,
					data: [
                        {inherit:{set:'neu', type:'equalDistribution', n: 4, seed: 'neuP'}, data:{block: 'practice'}}
					]
				}
			]
		},
		
		{
		    inherit : {set:"inst_start" }
		},
	    {
			mixer: 'random',
			data: [
				{
					mixer: 'repeat',
					times: 1,
					data: [
                        {inherit:{set:'cong', type:'equalDistribution', n: 3, seed: 'congE'}, data:{block: 'exp'}}
					]
				},
				{
					mixer: 'repeat',
					times: 1,
					data: [
                        {inherit:{set:'incong', type:'equalDistribution', n: 3, seed: 'incongE'}, data:{block: 'exp'}}
					]
				},
				{
					mixer: 'repeat',
					times: 1,
					data: [
                        {inherit:{set:'neu', type:'equalDistribution', n: 3, seed: 'neuE'}, data:{block: 'exp'}}
					]
				}
			]
		},
		{
		    inherit : {set:"inst_bye" }
		}
	]);	
	return API.script;
});
