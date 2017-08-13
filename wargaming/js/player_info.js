var APPLICATION_ID = "demo";

/*
    Main
*/
$(document).ready(function () {
    $("#player-request-form").keydown(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault ? event.preventDefault() : (event.returnValue = false); // Preventing sending of form on Enter pressed
            $("#player-request-form input[type=button]").trigger("click"); // Calling for button event listener
            return false;
        }
    });

    $("#player-request-form input[type=button]").on("click", function () { // On click of submit button
        $("#player-request-result").html(""); // Clear result field
        if (!$("#player-request-form input[name=player]")[0].value.match(/^[A-Za-z0-9_]{3,24}$/)) { // Checking for correct nickname
            $("#player-request-result").html("Пожалуйста, введите <a class=\"hinted-text\" title=\"От 3 до 24 символов. Только латиница, цифры или знак нижнего подчёркивания\">корректное имя</a>");
            return;
        }
        $("#player-request-form input").attr("disabled", "disabled");
        getFullInfo({
            "nickname": $("#player-request-form input[name=player]")[0].value,
            "onSuccess": function (player) {
                console.log(player);
                printPlayerFullInfo(player);
                $("#player-request-form input").removeAttr("disabled");
            },
            "onError": function (msg) {
                $("#player-request-result").html(msg);
                $("#player-request-form input").removeAttr("disabled");
            }
        });
    });
});

/*
    Functions
*/
function API_url(domain, game, section, subsection) // Returning url for request without any parametres
{
    /*
        Domain: ru || eu || com || asia (Not everything works on .asia)
    */
    return "https://api.worldoftanks." + domain + "/" + game + "/" + section + "/" + subsection + "/";
}

function getUserIdByName(player, options) // Requesting API for list of players. Options={domain:string, onSuccess:function (player){...}, onError:function (msg){...}}
{
    if (options.domain === "global") { // Searching on every domain (ru->eu->com)
        getUserIdByName(player, { // Check_1
            "domain": "ru",
            "onSuccess": options.onSuccess,
            "onError": function (msg1) {
                if (msg1 === "Возникла ошибка при обработке запроса") { // Unsuccesful request
                    options.onError("Возникла ошибка при обработке запроса");
                    return;
                }
                getUserIdByName(player, { // Check_2
                    "domain": "eu",
                    "onSuccess": options.onSuccess,
                    "onError": function (msg2) {
                        getUserIdByName(player, { // Check_3
                            "domain": "com",
                            "onSuccess": options.onSuccess,
                            "onError": function (msg3) {
                                options.onError("Игрок не найден");
                            }
                        });
                    }
                });
            }
        });
    } else { // Searching on one domain
        $.ajax({
            "cache": false,
            "complete": function (data)
            {
                if (data.status != 200) { // Unsuccesful request
                    options.onError("Возникла ошибка при обработке запроса");
                    return;
                }
                var playersList = JSON.parse(data.responseText);
                if (!playersList.data.length || playersList.data[0].nickname.toLowerCase() != player.nickname.toLowerCase()) { // Got no results or have not found needed player
                    options.onError("Игрок не найден");
                    return;
                }
                player.nickname = playersList.data[0].nickname;
                player.account_id = playersList.data[0].account_id;
                player.domain = options.domain;
                options.onSuccess(player); // Successfuly determined account id
            },
            "data":
            {
                "application_id": APPLICATION_ID,
                "search": player.nickname
            },
            "method": "GET",
            "url": API_url(options.domain, "wot", "account", "list")
        });
    }
}

function getUserInfoById(player, options) // Requesting API for player info. Options={onSuccess:function (player){...}, onError:function (msg){...}}
{
    $.ajax({
        "cache": false,
        "complete": function (data)
        {
            if (data.status != 200) { // Unsuccesful request
                options.onError("Возникла ошибка при обработке запроса");
                return;
            }
            var info = JSON.parse(data.responseText).data[player.account_id];
            player.info = info;
            options.onSuccess(player); // Successfuly determined account info
        },
        "data":
        {
            "application_id": APPLICATION_ID,
            "account_id": player.account_id
        },
        "method": "GET",
        "url": API_url(player.domain, "wot", "account", "info")
    });
}

function getUserTanksById(player, options) // Requesting API for player tanks. Options={onSuccess:function (player){...}, onError:function (msg){...}}
{
    $.ajax({
        "cache": false,
        "complete": function (data)
        {
            if (data.status != 200) { // Unsuccesful request
                options.onError("Возникла ошибка при обработке запроса");
                return;
            }
            var info = JSON.parse(data.responseText).data[player.account_id];
            player.tanks = info;
            options.onSuccess(player); // Successfuly determined account info
        },
        "data":
        {
            "application_id": APPLICATION_ID,
            "account_id": player.account_id
        },
        "method": "GET",
        "url": API_url(player.domain, "wot", "account", "tanks")
    });
}

function getClanInfo(player, options) // Requesting API for caln info. Options={onSuccess:function (player){...}, onError:function (msg){...}}
{
    $.ajax({
        "cache": false,
        "complete": function (data)
        {
            if (data.status != 200) { // Unsuccesful request
                options.onError("Возникла ошибка при обработке запроса");
                return;
            }
            var info = JSON.parse(data.responseText).data[player.info.clan_id];
            player.clan = info;
            options.onSuccess(player); // Successfuly determined account info
        },
        "data":
        {
            "application_id": APPLICATION_ID,
            "clan_id": player.info.clan_id
        },
        "method": "GET",
        "url": API_url(player.domain, "wot", "globalmap", "claninfo")
    });
}

function getFullInfo(options) // Getting full info. Options={nickname = string, onSuccess:function (player){...}, onError:function (msg){...}}
{
    // Got name from form
    var player = {}; // Object with data about requested player
    player.nickname = options.nickname;
    getUserIdByName(player, { // Get id from request
        "domain": "global",
        "onSuccess": function (player) {
            console.log ("Got account Id: ", player);
            var answered_requests = 0; // Counting requests. May be done with $.when() but not necessary with little amount of requests
            var total_requests = 2;
            getUserInfoById(player, { // Get info from request
                "onSuccess": function (player) {
                    console.log ("Got user info: ", player);
                    if (player.info.clan_id !== null) { // If player joined any clan
                        getClanInfo(player, {
                            "onSuccess": function (player) {
                                console.log ("Got user clan: ", player);
                                answered_requests++;
                                if (answered_requests === total_requests) {
                                    options.onSuccess(player);
                                }
                            },
                            "onError": options.onError
                        });
                    } else {
                        answered_requests++;
                        if (answered_requests === total_requests) {
                            options.onSuccess(player);
                        }
                    }
                },
                "onError": options.onError
            });
            getUserTanksById(player, { // Get tanks from request
                "onSuccess": function (player) {
                    console.log ("Got user tanks: ", player);
                    answered_requests++;
                    if (answered_requests === total_requests) {
                        options.onSuccess(player);
                    }
                },
                "onError": options.onError
            });
        },
        "onError": options.onError
    });
}

function timestampToDate(s) // Returning date in format
{
    var date = new Date(s * 1000); // Need ms => *1000
    var f = function (s) // Add '0' in front
    {
        return +(s) < 10 ? "0" + s : s;
    }
    return f(date.getDate()) + "." + f(date.getMonth() + 1) + "." + date.getFullYear();
}

function printPlayerFullInfo(player) // Printing player info
{
    $("#player-request-result").html(""); // Clear result field
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Ник:</span><span class=\"result-item__value\">" + player.nickname + "</span></div>");
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Id:</span><span class=\"result-item__value\">" + player.account_id + "</span></div>");
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Зарегистрировался:</span><span class=\"result-item__value\">" + timestampToDate(player.info.created_at) + "</span></div>");
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Последний раз был в сети:</span><span class=\"result-item__value\">" + (player.info.logout_at === 0 ? "Не был в сети" : timestampToDate(player.info.logout_at)) + "</span></div>");



    if (player.info.statistics.all.battles) {

        $("#player-request-result").append("<div class=\"horizontal-line\"></div>");

        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Боёв сыграно:</span><span class=\"result-item__value\">" + player.info.statistics.all.battles + "</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Из них выиграно:</span><span class=\"result-item__value\">" + player.info.statistics.all.wins + " (" + Math.round(player.info.statistics.all.wins * 10000 / player.info.statistics.all.battles) / 100 + "%)</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Противников уничтожено:</span><span class=\"result-item__value\">" + player.info.statistics.all.frags + "</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Деревьев уничтожено:</span><span class=\"result-item__value\">" + player.info.statistics.trees_cut + "</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Меткость:</span><span class=\"result-item__value\">" + Math.round(player.info.statistics.all.hits * 10000 / player.info.statistics.all.shots) / 100 + "%</span></div>");
    }

    if (player.clan) {

        $("#player-request-result").append("<div class=\"horizontal-line\"></div>");

        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Клан:</span><span class=\"result-item__value\">" + player.clan.name + "</span></div>");
    }
}
