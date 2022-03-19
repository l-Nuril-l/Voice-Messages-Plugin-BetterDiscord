# Installation / Usage

1. Download the `VoiceMessages.plugin.js` file and place it inside of your plugins folder
2. Follow the instructions in the section below to install a required program to enable microphone usage
3. Enable the plugin
4. Access the recording feature by clicking the **plus** icon in your message bar
5. Click `Record Voice Message` to begin your recording
6. Once you are done recording your message click on the plus again and choose `End Recording`
7. Discord will then prompt you to send your voice message as a file in the chat


<img src="https://i.imgur.com/CWOea6x.png" height="250px" width="auto"></img>
<img src="https://i.imgur.com/7JBEoSj.png" height="250px" width="auto"></img>

# Dependency Instructions

This plugin ***requires*** you to install [SoX](http://sox.sourceforge.net) and it must be available in your `$PATH`.

## Automatic

* When enabling the plugin you should be prompted to install soX, if not go to the plugin settings and click the install dependencies button
* Follow the instructions given on the popup
* Restart your application (fully not just reload)
* If you are still encountering issues try manually installing with the steps below

## Manual

### For Mac OS
`brew install sox`

### For most linux disto's
`sudo apt-get install sox libsox-fmt-all`

### For Windows
[download the binaries](http://sourceforge.net/projects/sox/files/latest/download)

## Editing Environment Variables (Windows)

[Follow this guide](https://www.tenforums.com/tutorials/121855-edit-user-system-environment-variables-windows.html#option5)

* Make sure you are editing your *User* Variables, ***not*** the *System*
* If there is not already one, create a variable named `Path` 
* Edit this variable and add the file path you chose when installing soX
* On Windows the default path is `C:\Program Files (x86)\sox-14-4-2`
