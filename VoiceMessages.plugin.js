/**
 * @name VoiceMessages
 * @version 1.1.0
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
            version: "1.1.0",
            description: "Voice Messages",
            github: "https://github.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/tree/master",
            github_raw: "https://raw.githubusercontent.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/master/VoiceMessages.plugin.js",
        },
        changelog: [{
            title: "Send voice messages!",
            items: ["Now you can send voice messages :)", "Press F12 to start recording, or stop and send it!"]
        }]
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
                    WebpackModules,
                } = Library;

                'use strict'

                var discordVoice = DiscordNative.nativeModules.requireModule("discord_voice"); // Recording process

                class record {
                    // returns a Readable stream
                    static start = function (options) {

                        discordVoice.startLocalAudioRecording(
                            {
                                echoCancellation: true, //settings.store.echoCancellation
                                noiseCancellation: true //settings.store.noiseSuppression,
                            },
                            (success) => {
                                if (success)
                                    console.log("STARTED RECORDING");
                                else
                                    BdApi.showToast("Failed to start recording", {
                                        type: "failure"
                                    });
                            }
                        );
                    }

                    static stop = function () {
                        discordVoice.stopLocalAudioRecording((filePath) => {
                            if (filePath) {
                                try {
                                    require("fs").readFile(filePath, {}, (err, buf) => {
                                        if (buf) {
                                            WebpackModules.getByProps("instantBatchUpload", "upload").instantBatchUpload(
                                                {
                                                    channelId: channel.getChannelId(),
                                                    files: [new File([new Blob([buf], { type: "audio/ogg; codecs=opus" })], "Voice Message.ogg", { type: "audio/ogg; codecs=opus" })]
                                                })
                                        }
                                        else
                                            BdApi.showToast("Failed to finish recording", {
                                                type: "failure"
                                            });
                                    });
                                }
                                catch (e) {
                                    console.log(e);
                                }
                            }
                            console.log("STOPPED RECORDING");
                        });

                    }
                }

                var recording = true

                const {
                    showToast
                } = BdApi;
                const channel = BdApi.findModuleByProps("getLastSelectedChannelId")

                function toggleRecording() {
                    if (recording === true) {
                        record.start()
                        recording = false
                        showToast("Started Recording", {
                            type: "success"
                        })
                    } else {
                        showToast("Stopped Recording", {
                            type: "success"
                        })
                        recording = true
                        record.stop()
                    }
                }

                startFunc = function (event) {
                    if (event.key === 'F12') {
                        toggleRecording();

                        // Предотвращение открытия инструментов разработчика
                        event.preventDefault();
                    }
                };
                ///////////////
                return class VoiceMessages extends Plugin {
                    constructor() {
                        super();
                        this.active = true;
                    }

                    onStart() {
                        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "https://raw.githubusercontent.com/l-Nuril-l/Voice-Messages-Plugin-BetterDiscord/master/VoiceMessages.plugin.js");
                        document.addEventListener('keydown', startFunc);
                    }

                    onStop() {
                        document.removeEventListener('keydown', startFunc)
                        this.active = false;
                    }
                };
            };
            return plugin(Plugin, Api);
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
