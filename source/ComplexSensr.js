enyo.kind({
    name: "ComplexSensr",
    style: "background-color: #254048; color: white; border-color: white; height: 100%;",
    published: {
        complex: false,
        data: ""
    },
    events: {
        onSubmisisonMade: "",
        on2DrawerClick: "",
        onRenderScroller: "",
    },
    handlers: {
        onSenseOpened: "openNext",
        onPhotoOk: "photoOk",
        onDeviceReady: "setReady",
        //onGPSSet: "currentLocation",
        onDrawerOk: "openDrawer2",
        onRenderDrawer: "renderDrawer2"
    },
    components: [
        {kind: "enyo.Signals", onGPSSet: "currentLocation", onPinClicked: "chosenLocation", onPhotoData: "photoData", onButtonGroupChosen: "renderSubmitButton"},
        {name: "formDiv", layoutKind: "enyo.FittableRowsLayout", components: []},
        {name: "buttons", classes: "senseButtons", components: [
            {kind: "onyx.Button", classes: "onyx-negative", content: "Cancel", ontap: "close", style: "clear: left;"},
            {name: "submit", kind: "onyx.Button", classes: "onyx-affirmative", content: "Submit", ontap: "buildAndSendSubmission", style: "clear: right;"}
        ]}
    ],
    create: function(a, b) {
        this.inherited(arguments);
	this.recreate();
        this.render();
        this.setTaskData(this.data);
    },
    recreate: function() {
	this.log(this.$.formDiv);
	if(this.$.formDiv === undefined) 
	    this.createComponent({name: "formDiv", layoutKind: "enyo.FittableRowsLayout", components: []});
        if(this.complex) {
            this.$.formDiv.createComponent(
                {kind: "enyo.FittableRows", /*fit: true,*/ kind: "enyo.Scroller", vertical: "scroll", strategyKind: "TranslateScrollStrategy", name: "acc", style: " width: 100%;", components: [
                    {content: "Questions about you",ontap: "activateFormDrawer",classes: "accordionHeader"},
                    {name: "qs",kind: "onyx.Drawer", fit: true, open: false, layoutKind: "enyo.FittableRowsLayout", style: "white-space: nowrap; overflow: scroll; height: 100%;",components: [
                        {kind: "enyo.Scroller", layoutKind: "enyo.FittableRowsLayout", vertical: "scroll", strategyKind: "TranslateScrollStrategy", name: "accordionItemContent", style: "height: 293px;", components: []} 
                    ]}
                ]},
                {owner: this}
            );
        } else {
	    this.log("building formDiv");
	    this.imageOK = true; //fix this later
            this.$.formDiv.createComponent(
                {name: "qbody", fit: true, components: [
		    //THIS NEEDS TO BE A TYPE OF QUESTION
                    /*{name: "imgDiv",classes: "imgDiv",components: [
                        {name: "photoButton",kind: "onyx.Button",content: "Take Photo",style: "width: 100%;",ontap: "retakePhoto",classes: "onyx-affirmative"}
                    ]}*/
                ]}
            );
        }
    },
    rendered: function(inSender, inEvent) {
        this.inherited(arguments);
        this.resized();
        this.reflow();
    },
    activateFormDrawer: function(a, b) {
        a.addRemoveClass("accordionHeaderHighlight", !this.$.qs.open), this.$.qs.setOpen(!this.$.qs.open);
    },
    activateFormDrawer2: function(a, b) {
        this.waterfall("on2DrawerClick", {name: "ComplexSensr"});
    },
    openDrawer2: function(a, b) {
        this.$.draw2.reflow();
        this.$.draw2.addRemoveClass("accordionHeaderHighlight", !this.$.qs1.open);
        this.$.qs1.setOpen(!this.$.qs1.open);
        return true;
    },
    currentLocation: function() {
    //currentLocation: function(inSender, inEvent) {
        /*this.log(inEvent);
        this.gps_location = inEvent.prop;
        this.log(this.gps_location);*/
    },
    chosenLocation: function(a, b) {
        this.chosen_location = b;
    },
    photoData: function(a, b) {
        LocalStorage.set("image", JSON.stringify(b));
    },
    takePhoto: function() {
        this.log();
        var a = this.$, b = {
            quality: 25,
            destinationType: Camera.DestinationType.FILE_URI,
            EncodingType: Camera.EncodingType.JPEG
        };
        navigator.camera.getPicture(enyo.bind(a, this.onPhotoSuccess), enyo.bind(a, this.onPhotoFail), b);
    },
    onPhotoSuccess: function(a) {
        var b = a;
        this.$.formDiv.$.qbody.$.imgDiv.createComponent({
            name: "myImage",
            kind: "enyo.Image",
            src: "./assets/leaf-2.jpg"
        });
		this.$.formDiv.$.qbody.$.imgDiv.render();
		this.$.submit.setDisabled(false);
		this.camComplete = true;
		enyo.Signals.send("onPhotoData", a);
    },
    renderSubmitButton: function(a, b) {
        this.$.submit.setDisabled(!1);
    },
    renderDrawer2: function(inSender, inEvent) {
        this.$.draw2.reflow();
        this.$.draw2.render();
    },
    onPhotoFail: function(a) {
        console.log(a);
    },
    retakePhoto: function() {
        !this.complex && this.$.formDiv.$.qbody.$.imgDiv.getComponents().length > 0 && this.$.formDiv.$.qbody.$.imgDiv.destroyComponents(), this.onPhotoSuccess();
    },
    viewChanged: function(a, b) {},
    openNext: function() {
        return !this.complex, !0;
    },
    photoOk: function() {
        return this.log(), !0;
    },
    setTaskData: function(a) {
        this.task = a.tasks[0];
        this.campTitle = a.title;
        questionBody = [];
        if(this.$.formDiv != undefined && this.$.formDiv.getComponents().length > 0 ) {
            this.$.formDiv.destroyClientControls();
            this.$.formDiv.destroy()
	    this.recreate();
        }
        if(this.complex)
            questionBody.push(this.$.accordionItemContent);
        else {
	    this.log(this.$);
            questionBody.push(this.$.formDiv.$.qbody);
	}

        for (i in this.task.questions) {
            var b = this.task.questions[i], c = "name_" + b.id;
            type = b.type;
            if (type.indexOf("complex") != -1) {
                type = "counter";
                var d = type.search(/\d/), e = 0;
                if (d != -1) var e = type.charAt(d);
                if (e != questionBody.length && this.complex) {
                    var f = "qs" + (e + 1);
                    this.$.formDiv.createComponent(
                        {name: "draw2", content: "Count Bicycles and/or Pedestrians", ontap: "activateFormDrawer2", classes: "accordionHeader"},
                        {owner: this}
                    );
                    this.$.formDiv.createComponent(
                        {name: f, kind: "onyx.Drawer", open: !1, style: "white-space: nowrap; overflow: hidden;", components: [
                            {name: "accordionItemContent2", components: []}
                        ]},
                        {owner: this}
                    );
                    questionBody.push(this.$.accordionItemContent2);
                }
            }
            switch (type) {
                case "text":
                    questionBody[0].createComponent({name: c, style: "clear: both;", content: b.question});
					this.newFormText(b);
                break;
                case "exclusive_multiple_choice":
                    questionBody[0].createComponent({name: c, style: "clear: both;", content: b.question});
					this.newFormExclusiveChoice(b);
                break;
                case "multiple_choice":
                    questionBody[0].createComponent({name: c, style: "clear: both;", content: b.question});
					this.newFormMultipleChoice(b);
                break;
                case "counter":
                    this.newFormCounter(b);
                break;
                case "cur_time":
                    this.newTime(b);
                break;
                default:
            }
        }
        this.render();
	this.log(this.$);
	if(this.complex) {
	    this.$.accordionItemContent.resized();
	    this.$.accordionItemContent.reflow();
	}
        /*this.$.formDiv.resized();
        this.$.formDiv.reflow();*/
    },
    fileEntry: function(a) {
        window.resolveLocalFileSystemURI(a, this.getImageData, null);
    },
    getImageData: function(a) {
        read = new FileReader, console.log(a), read.onloadend = function(a) {
            console.log(a.target.result);
        };
        var b = read.readAsDataURL(a);
        console.log(b);
    },
    makeImageSend: function(a, b) {
        var c = btoa(this.utf8_encode(b));
        this.$.senses.createComponent({
            kind: "enyo.Image",
            src: "data:image/jpeg;base64," + c
        });
        //this.render();
        var d = "image?", e = new Date, f = (e.getMonth() + 1).toString();
        while (f.length < 2) f = "0" + f;
        var g = e.getDate().toString();
        while (g.length < 2) g = "0" + g;
        var h = e.getFullYear().toString() + f.toString() + g.toString() + "_" + e.getHours().toString() + e.getMinutes().toString() + e.getSeconds().toString();
        d += "userName=" + Data.getUserName(LocalStorage.get("user")) + "&", d += "imageFileName=" + this.campTitle.replace(/ /g, "%20") + "_" + h + ".jpg&";
        var i = Data.getURL() + d, j = new enyo.Ajax({
            method: "POST",
            url: i,
            contentType: "image/jpeg"
        });
        j.response(this, "imageSubmission");
    },
    buildAndSendSubmission: function() {
        if (!this.$.submit.disabled) {
            //this.complex || this.fileEntry(this.$.imgDiv.$.myImage.src);
	    this.log(this.imageOK ? !this.complex : this.complex);
            if (this.imageOK ? !this.complex : this.complex) {
                var a = {submission: {
                            task_id: this.task.id,
                            gps_location: "testy test",
                            user_id: 5,
                            img_path: "test",
                            answers: []
                            }
                        };
                var gps_location = Data.getLocationData();
                var b = gps_location.latitude + "|" + gps_location.longitude;
                a.submission.gps_location = b;
                a.submission.user_id = LocalStorage.get("user");

                for (i in this.task.questions) {
                    var c = this.task.questions[i];
                    type = c.type;
                    if (type.indexOf("complex") != -1) {
                        type = "counter";
                        var d = type.search(/\d/), e = 0;
                        if (d != -1) var e = type.charAt(d);
                        if (e != questionBody.length && this.complex) var f = "qs" + (e + 1);
                    }
                    var g = {
                        answer: "BOOM",
                        type: c.type,
                        q_id: c.id,
                        sub_id: 0
                    };
                    switch (type) {
                        case "text":
                            g.answer = this.readFormText(c);
			    a.submission.answers.push(g);
                        break;
                        case "exclusive_multiple_choice":
                            g.answer = this.readFormExclusiveChoice(c);
			    a.submission.answers.push(g);
                        break;
                        case "multiple_choice":
                            g.answer = this.readFormMultipleChoice(c);
			    a.submission.answers.push(g);
                        break;
                        case "counter":
			    //var tmp = this.readFormCounter(c);
			    var array = this.readFormCounter(c).split("|");
			    for (x in array) {
				var ans = {
				    answer: "BOOM",
				    type: c.type,
				    q_id: c.id,
				    sub_id: 0
				}
				var again = array[x].split(",");
				again.splice(0,1);
				this.log(again[0]);
				var date = new Date()
				date.setTime(again[0]);
				this.log(date);
				again[0]=date;
				ans.answer=again.join(",");
				a.submission.answers.push(ans);
			    }
			break;
			case "cur_time":
			    g.answer = this.readTime(c);
			    a.submission.answers.push(g);
			break;
                        default:
                            continue;
                    }
                }

                this.log("SENDING TO SERVER: " + JSON.stringify(a));
                var h = Data.getURL() + "submission.json", j = new enyo.Ajax({
                    contentType: "application/json",
                    method: "POST",
                    url: h,
                    postBody: JSON.stringify(a),
                    cacheBust: !1,
                    handleAs: "json"
                });
                j.response(this, "handlePostResponse"), j.go();
            }
        }
    },
    handlePostResponse: function(a, b) {
        this.log("SERVER RESPONSE CAME BACK");
		this.log(JSON.stringify(a.xhr.responseText));
		this.bubble("onSubmissionMade");
		this.camComplete = !1;
		this.$.submit.setDisabled(!0);
		this.chosen_location = undefined;
		LocalStorage.remove("image");
		this.imageOK = !1;
		if(!this.complex && this.$.imgDiv.getComponents().length > 0)
			this.$.imgDiv.destroyComponents();
    },
    imageSubmission: function(a, b) {
        this.log(JSON.stringify(a)), this.log(JSON.stringify(b));
    },
    close: function() {
        this.bubble("onSubmissionMade");
    },
    testButtons: function(a, b) {
	this.log(questionBody[0].$);
	if(this.complex) {
	    this.log();
	    var controls = questionBody[0].$.groupbox.getControls();
	    var inName = a.getContent();
	    var b = true;
	    var p = true;
	    if(inName === "Bicycles") {
		b = true;
		p = false;
	    } else if (inName === "Pedestrians") {
		b = false;
		p = true;
	    }  else if (inName === "Both") {
		p = true;
		b = true;
	    }

	    for (var i in controls) {
		var num = controls[i].name.split("_")[1];
		this.$["checkbox_"+num].setDisabled(false);
		if(controls[i].getContent() === "Helmet" && !b)
                this.$["checkbox_"+num].setDisabled(true);
            else if(controls[i].getContent() === "Assistive" && !p)
                this.$["checkbox_"+num].setDisabled(true);
	    }
	}
        enyo.Signals.send("onButtonGroupChosen", a);
    },
    newFormText: function(a) {
        var b = "inputDec_" + a.id, c = "input_" + a.id;
        questionBody[0].createComponent({
            name: b,
            style: "clear: both;",
            kind: "onyx.InputDecorator",
            classes: "onyx-input-decorator center",
	    style: "outline-color: white; border-color: white;",
            components: [ {
                name: c,
                kind: "onyx.Input",
                classes: "onyx-input"
            } ]
        }, {
            owner: questionBody[0]
        });
    },
    newFormExclusiveChoice: function(a) {
        var b = "input_" + a.id, c = a.options.split("|"), d = [];
        for (i in c) i == 0 ? d.push({
            content: c[i],
            active: !0,
            ontap: "testButtons"
        }) : d.push({
            content: c[i],
            ontap: "testButtons"
        });
        questionBody[0].createComponent({
            name: b,
            kind: "onyx.RadioGroup",
	    classes: "center",
            components: d
        }, {
            owner: this
        });
    },
    newTime: function(a) {
        var b = new Date, c = b.toTimeString().split(" ")[0], d = "time_" + a.id;
        questionBody[0].createComponent({
            content: a.question
        }), questionBody[0].createComponent({
            name: d,
            content: c,
	    classes: "center",
            time: b.toTimeString()
        });
    },
    newFormMultipleChoice: function(a) {
        var b = a.options.split("|");
        questionBody[0].createComponent({
            name: "groupbox",
	    classes: "center;",
            kind: "onyx.Groupbox",
            components: []
        }, {
            owner: questionBody[0]
        });
        for (i in b) {
            var c = "checkbox_" + i, d = "content_" + i, e = [];
            questionBody[0].$.groupbox.createComponent({
                name: c,
                kind: "onyx.Checkbox",
                onchange: "testButtons",
                style: "float: left; clear: left;"
            }, {
                owner: this
            });
            questionBody[0].$.groupbox.createComponent({
                name: d,
                content: b[i],
                style: "float: left; clear: right;"
            });
        }
    },
    newFormCounter: function(a) {
        var b = "name_" + a.id, c = "counter_" + a.id, d;
        for (x in this.task.questions) if (this.task.questions[x].type === "exclusive_multiple_choice") {
            d = this.task.questions[x].id.toString();
            break;
        }
        var e = "input_" + d;
        if (a.type.split("_")[1].indexOf("2") === -1) {
            questionBody[1].createComponent({
            name: c,
            kind: "BikeCounter",
            title: a.question,
            style: "clear: both;"
        }); 
        } else {
            questionBody[2].createComponent({
            name: c,
            kind: "BikeCounter",
            title: a.question,
            style: "clear: both;"
        });
        }
    },
    readFormText: function(a) {
        var b = "input_" + a.id;
        return questionBody[0].$[b].getValue();
    },
    readFormExclusiveChoice: function(a) {
        var b = "input_" + a.id, c = this.$[b].children;
        for (x in c) if (c[x].hasClass("active")) return c[x].getContent();
    },
    readFormMultipleChoice: function(a) {
        var b = [];
        for (i in a.options.split("|")) {
            var c = "checkbox_" + i, d = "content_" + i;
            this.$[c].getValue() && b.push(questionBody[0].$.groupbox.$[d].getContent());
        }
        return b.join("|");
    },
    readFormCounter: function(a) {
        var out;
        c = "counter_" + a.id;
        for (var d in questionBody) {
            var e = questionBody[d].$[c];
            this.log(e);
            if (e === undefined) continue;
            out = e.getData();
        }
        this.log(out);

        return out.join("|");
    },
    readTime: function(a) {
        var b = "time_" + a.id;
	var ret = questionBody[0].$[b].time;
        return ret;
    }
});