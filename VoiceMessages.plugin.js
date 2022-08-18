/**
 * @name VoiceMessages
 * @author Nuril
 * @authorId 288671468349292545
 * @website https://github.com/l-Nuril-l
 * @source https://github.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/tree/master
 * @updateUrl https://raw.githubusercontent.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/master/VoiceMessages.plugin.js
 * @invite dQJNqcY
 */
module.exports = (() => {
    const config = {
        info: {
            name: "VoiceMessages",
            authors: [{
                name: "Nuril",
                discord_id: "288671468349292545",
                github_username: "l-Nuril-l"
            }],
            version: "1.0.1",
            description: "Voice Messages",
            github: "https://github.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/tree/master",
            github_raw: "https://raw.githubusercontent.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/master/VoiceMessages.plugin.js",
        },
        changelog: [{
            title: "New plugin!",
            items: ["Now you can send voice messages :)"]
        }],
        // defaultConfig: [{
        //     type: "category", id: "global", name: "Global Settings", collapsible: true, shown: true,
        //     settings: [{ type: "switch", id: "dependencies", name: "Install Dependencies", note: "Sox installation." },
        //                 {type: "switch", id: "noice", name: "Noise suppression", note: "Removes noise from recorded message." }]
        // },
        // {
        //     type: "category", id: "modules", name: "Module Settings", collapsible: true, shown: false,
        //     settings: [{ type: "switch", id: "typing", name: "Typing", note: "Toggles colorizing of typing notifications.", value: true },
        //     { type: "switch", id: "voice", name: "Voice", note: "Toggles colorizing of voice users.", value: true },
        //     { type: "switch", id: "mentions", name: "Mentions", note: "Toggles colorizing of user mentions in chat.", value: true },
        //     { type: "switch", id: "chat", name: "Chat", note: "Toggles colorizing the message text of users in chat.", value: true },
        //     { type: "switch", id: "botTags", name: "Bot Tags", note: "Toggles coloring the background of bot tags to match role.", value: true },
        //     { type: "switch", id: "memberList", name: "Memberlist Headers", note: "Toggles coloring role names in the member list.", value: true }]
        // }],
    };




    return !global.ZeresPluginLibrary ?
        class {
            constructor() {
                this._config = config;
            }
            getName() {
                return config.info.name;
            }
            getAuthor() {
                return config.info.authors.map((a) => a.name).join(", ");
            }
            getDescription() {
                return config.info.description;
            }
            getVersion() {
                return config.info.version;
            }
            load() {
                BdApi.showConfirmationModal(
                    "Library Missing",
                    `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get(
                            "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                            async (error, response, body) => {
                                if (error)
                                    return require("electron").shell.openExternal(
                                        "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                                    );
                                await new Promise((r) =>
                                    require("fs").writeFile(
                                        require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                                        body,
                                        r
                                    )
                                );
                            }
                        );
                    },
                }
                );
            }
            start() { }
            stop() { }
        } :
        (([Plugin, Api]) => {
            const plugin = (Plugin, Library) => {

                const {
                    Logger,
                    Patcher,
                    WebpackModules,
                    DiscordModules,
                    DOMTools,
                    PluginUtilities,
                    ContextMenu,
                    Settings
                } = Library;

                'use strict'

                var spawn = require('child_process').spawn

                var cp // Recording process

                class record {
                    // returns a Readable stream
                    static start = function (options) {
                        cp = null // Empty out possibly dead recording process

                        var defaults = {
                            sampleRate: 48000,
                            channels: 1,
                            compress: false,
                            threshold: 0.5,
                            thresholdStart: null,
                            thresholdEnd: null,
                            silence: '1.0',
                            verbose: false,
                            recordProgram: 'sox'
                        }

                        options = Object.assign(defaults, options)

                        // Capture audio stream
                        var cmd, cmdArgs, cmdOptions, audioType
                        switch (options.recordProgram) {
                            // On some Windows machines, sox is installed using the "sox" binary
                            // instead of "rec"
                            case 'sox':
                                cmd = "sox"
                                audioType = "wav"
                                if (options.audioType) audioType = options.audioType
                                if (options.asRaw) audioType = "raw"
                                cmdArgs = [
                                    '-v', '2.0',
                                    '-q', // show no progress
                                    '-t', 'waveaudio',
                                    '-d',
                                    '-r', options.sampleRate.toString(), // sample rate
                                    '-c', '1', // channels
                                    '-e', 'signed-integer', // sample encoding
                                    '-b', '16', // precision (bits)
                                    '-t', audioType, // audio type
                                    '-'
                                ]
                                break
                            case 'rec':
                            default:
                                cmd = "rec"
                                audioType = "wav"
                                if (options.audioType) audioType = options.audioType
                                cmdArgs = [
                                    '-q', // show no progress
                                    '-r', options.sampleRate, // sample rate
                                    '-c', options.channels, // channels
                                    '-e', 'signed-integer', // sample encoding
                                    '-b', '16', // precision (bits)
                                    '-t', audioType, // audio type
                                    '-', // pipe
                                    // end on silence
                                    'silence', '1', '0.1', options.thresholdStart || options.threshold + '%',
                                    '1', options.silence, options.thresholdEnd || options.threshold + '%'
                                ]
                                break
                            // On some systems (RasPi), arecord is the prefered recording binary
                            case 'arecord':
                                cmd = 'arecord'
                                audioType = "wav"
                                if (options.audioType) audioType = options.audioType
                                cmdArgs = [
                                    '-q', // show no progress
                                    '-r', options.sampleRate, // sample rate
                                    '-c', options.channels, // channels
                                    '-t', audioType, // audio type
                                    '-f', 'S16_LE', // Sample format
                                    '-' // pipe
                                ]
                                if (options.device) {
                                    cmdArgs.unshift('-D', options.device)
                                }
                                break
                        }

                        // Spawn audio capture command
                        cmdOptions = {
                            encoding: 'binary'
                        }
                        if (options.device) {
                            cmdOptions.env = Object.assign({}, process.env, {
                                AUDIODEV: options.device
                            })
                        }
                        cp = spawn(cmd, cmdArgs, cmdOptions)
                        var rec = cp.stdout

                        if (options.verbose) {
                            console.log('Recording', options.channels, 'channels with sample rate',
                                options.sampleRate + '...')
                            console.time('End Recording')

                            rec.on('data', function (data) {
                                console.log('Recording %d bytes', data.length)
                            })

                            rec.on('end', function () {
                                console.timeEnd('End Recording')
                            })
                        }

                        return rec
                    }

                    static stop = function () {
                        if (!cp) {
                            console.log('Please start a recording first')
                            return false
                        }

                        cp.kill() // Exit the spawned process, exit gracefully

                        return cp
                    }
                }

                var recording = "🎤 Record Voice Message"

                const {
                    React
                } = BdApi;
                const fs = require('fs')

                const https = require('https')
                const http = require('http')
                const dir = BdApi.Plugins.folder + '\\soX';
                const MenuItem = BdApi.findModuleByProps("MenuItem");
                const ModalStack = BdApi.findModuleByProps("pushLazy");
                const channel = BdApi.findModuleByProps("getLastSelectedChannelId")
                const button = BdApi.findModuleByProps("Button").Button;
                const UploadActions = BdApi.findModuleByProps("pushFiles");
                const TextInput = BdApi.findModuleByDisplayName("TextInput");
                const UploadModal = BdApi.findModuleByDisplayName("UploadModal");
                const ChannelAttachMenu = BdApi.findModule(m => m?.default?.displayName === "ChannelAttachMenu")
                const soXWinUrl = "https://cdn.discordapp.com/attachments/765689401061539840/954245900832759838/soXInstall.exe"

                function toggleRecording() {
                    if (recording === "🎤 Record Voice Message") {
                        startRecord()
                    } else {
                        BdApi.showToast("Stopped Recording", {
                            type: "success"
                        })
                        recording = "🎤 Record Voice Message"
                        record.stop()
                    }
                }

                function startRecord() {
                    recording = "End Recording"
                    BdApi.showToast("Started Recording", {
                        type: "success"
                    })
                    const result = []
                    const recordStream = record.start()
                    recordStream.on('data', function (chunk) {
                        result.push(chunk)
                    });
                    recordStream.on('end', () => {
                        this.fileUploadMod = WebpackModules.getByProps("instantBatchUpload", "upload");

                        fileUploadMod.upload({
                            channelId: channel.getChannelId(),
                            file: new File([Buffer.concat(result)], "Voice Message.wav"),
                            hasSpoiler: false,
                            fileName: "",
                            draftType: 0,
                            message: { content: '' }
                        })

                        // setTimeout(() => this.fileUploadMod.instantBatchUpload(
                        //     channel.getChannelId(),
                        //     [new File([Buffer.concat(result)], "Voice Message.wav")]),
                        //     1000);
                    });
                }

                function installsoXWin() {


                    let exe = BdApi.Plugins.folder + "\\soX\\soXInstall.exe"
                    let bat = BdApi.Plugins.folder + "\\soX\\path.bat"

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }



                    if (!fs.existsSync(exe)) {
                        https.get(soXWinUrl, (response) => {
                            const result = []
                            response.on('data', function (chunk) {
                                result.push(chunk)
                            });
                            response.on('end', () => {
                                fs.writeFileSync(exe, Buffer.concat(result))
                            });
                        })
                    }

                    if (!fs.existsSync(bat)) {
                        let contents = `
                            setx sox "${dir}"
                            setx path "%%sox%%;%path%"
                            exit
                            `
                        fs.writeFileSync(dir + "\\path.bat", contents);
                    }

                    console.log(`start "" "${dir + '\\path.bat'}" `)
                    require('child_process').exec(`start "" "${dir + '\\path.bat'}" `)
                    require('child_process').exec(`start "" "${dir + '\\soXInstall.exe'}" `)

                    BdApi.saveData("VoiceMessages", "Installed", 1)

                }

                class winPopup extends React.Component {
                    render() {

                        return React.createElement("div", {
                            children: [
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 20,
                                        marginBottom: "10px"
                                    }
                                }, "Instructions"),
                                React.createElement("hr", {}),
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 15,
                                        marginBottom: "10px"
                                    }
                                }, "Click the button below to open the soX installer"),
                                BdApi.React.createElement(button, {
                                    onClick: installsoXWin,
                                    style: {
                                        marginBottom: "10px"
                                    }
                                }, "Open Installer"),
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 15,
                                        marginBottom: "10px"
                                    }
                                }, "Replace the destination folder with this"),
                                React.createElement(TextInput, {
                                    value: dir,
                                    style: {
                                        height: "30px"
                                    }
                                }),
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 15,
                                        marginBottom: "10px"
                                    }
                                }, "Click install"),
                            ]
                        })
                    }
                }


                class macPopup extends React.Component {
                    render() {

                        BdApi.saveData("VoiceMessages", "Installed", 1)

                        return React.createElement("div", {
                            children: [
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 20,
                                        marginBottom: "10px"
                                    }
                                }, "Instructions"),
                                React.createElement("hr", {}),
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 15,
                                        marginBottom: "10px"
                                    }
                                }, "Run the following command"),
                                React.createElement(TextInput, {
                                    value: "brew install sox",
                                    style: {
                                        height: "30px"
                                    }
                                }),
                            ]
                        })
                    }
                }

                class linuxPopup extends React.Component {
                    render() {

                        BdApi.saveData("VoiceMessages", "Installed", 1)

                        return React.createElement("div", {
                            children: [
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 20,
                                        marginBottom: "10px"
                                    }
                                }, "Instructions"),
                                React.createElement("hr", {}),
                                React.createElement("h1", {
                                    style: {
                                        color: "#ddd",
                                        fontSize: 15,
                                        marginBottom: "10px"
                                    }
                                }, "Run the following command"),
                                React.createElement(TextInput, {
                                    value: "sudo apt-get install sox libsox-fmt-all",
                                    style: {
                                        height: "30px"
                                    }
                                }),
                            ]
                        })
                    }
                }

                function soX() {
                    if (BdApi.getData("VoiceMessages", "Installed") != 1) {
                        switch (process.platform) {
                            case 'win32':
                                BdApi.showConfirmationModal("Install soX", React.createElement(winPopup, {}), {
                                    confirmText: "okay",
                                });
                                break;
                            case 'darwin':
                                BdApi.showConfirmationModal("Install soX", React.createElement(macPopup, {}), {
                                    confirmText: "okay",
                                });
                                break;
                            case 'linux':
                                BdApi.showConfirmationModal("Install soX", React.createElement(linuxPopup, {}), {
                                    confirmText: "okay",
                                });
                                break;
                        }
                    }
                }

                function dependencies() {
                    BdApi.saveData("VoiceMessages", "Installed", 0)
                    soX();
                }

                const ChannelAttachMenuPatch = () => BdApi.Patcher.after("ChannelAttachMenuPatch", ChannelAttachMenu, "default", (that, args, value) => {
                    const [props] = args;
                    value.props.children.push(React.createElement(MenuItem.MenuItem, {
                        label: recording,
                        id: "VoiceMessage-Init",
                        action: toggleRecording
                    }))
                    return value;
                });

                ///////////////
                return class QuickLastMessage extends Plugin {
                    constructor() {

                        super();

                        this.active = true;
                    }

                    onStart() {
                        ChannelAttachMenuPatch();
                        soX();
                    }

                    onStop() {
                        BdApi.Patcher.unpatchAll("ChannelAttachMenuPatch");
                        this.active = false;
                    }
                    getSettingsPanel() {

                        //return this.buildSettingsPanel().getElement();

                        return BdApi.React.createElement(button, {
                            onClick: dependencies
                        }, "Install Dependencies")

                    }
                };
            };
            return plugin(Plugin, Api);
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
