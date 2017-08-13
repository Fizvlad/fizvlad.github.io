var APPLICATION_ID = "demo";

/*
    Main
*/
var PLAYER; // Object with data about requested player

$(document).ready(function() {
    $("#player-request-form").keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault(); // Preventing sending of form on Enter pressed
            $("#player-request-form input[type=button]").trigger("click"); // Calling for button event listener
            return false;
        }
    });

    $("#player-request-form input[type=button]").on("click", function() { // On click of submit button
        PLAYER =
        {};
        $("#player-request-result").html(""); // Clear result field
        if (!$("#player-request-form input[name=player]")[0].value.match(/^[A-Za-z0-9_]{3,24}$/)) { // Checking for correct nickname
            $("#player-request-result").html("Пожалуйста, введите <a class=\"hinted-text\" title=\"От 3 до 24 символов. Только латиница, цифры или знак нижнего подчёркивания\">корректное имя</a>");
            return;
        }
        PLAYER.nickname = $("#player-request-form input[name=player]")[0].value;
        getFullInfo(function() {
            console.log(PLAYER);
            printPlayerFullInfo();
        }, function(msg) {
            $("#player-request-result").html(msg);
        });
    });
});

/*
    Functions
*/
function API_url(domain = "ru", game = "wot", section = "account", subsection = "list") // Returning url for request without any parametres
{
    /*
        Domain: ru || eu || com || asia (Not everything works on .asia)
    */
    return "https://api.worldoftanks." + domain + "/" + game + "/" + section + "/" + subsection + "/";
}

function getUserIdByName(options) // Requesting API for list of players. Options={domain:string, onSuccess:function(){...}, onError:function(msg){...}}
{
    if (options.domain == "global") { // Searching on every domain (ru->eu->com)
        getUserIdByName({ // Check_1
            "domain": "ru",
            "onSuccess": options.onSuccess,
            "onError": function(msg1) {
                if (msg1 == "Возникла ошибка при обработке запроса") { // Unsuccesful request
                    options.onError("Возникла ошибка при обработке запроса");
                    return;
                }
                getUserIdByName({ // Check_2
                    "domain": "eu",
                    "onSuccess": options.onSuccess,
                    "onError": function(msg2) {
                        getUserIdByName({ // Check_3
                            "domain": "com",
                            "onSuccess": options.onSuccess,
                            "onError": function(msg3) {
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
            "complete": function(data)
            {
                if (data.status != 200) { // Unsuccesful request
                    options.onError("Возникла ошибка при обработке запроса");
                    return;
                }
                var playersList = JSON.parse(data.responseText);
                if (!playersList.data.length || playersList.data[0].nickname.toLowerCase() != PLAYER.nickname.toLowerCase()) { // Got no results or have not found needed player
                    options.onError("Игрок не найден");
                    return;
                }
                PLAYER.nickname = playersList.data[0].nickname;
                PLAYER.account_id = playersList.data[0].account_id;
                PLAYER.domain = options.domain;
                options.onSuccess(); // Successfuly determined account id
            },
            "data":
            {
                "application_id": APPLICATION_ID,
                "search": PLAYER.nickname,
            },
            "method": "GET",
            "url": API_url(options.domain, "wot", "account", "list"),
        });
    }
}

function getUserInfoById(options) // Requesting API for player info. Options={onSuccess:function(){...}, onError:function(msg){...}}
{
    $.ajax({
        "cache": false,
        "complete": function(data)
        {
            if (data.status != 200) { // Unsuccesful request
                options.onError("Возникла ошибка при обработке запроса");
                return;
            }
            var info = JSON.parse(data.responseText).data[PLAYER.account_id];
            PLAYER.info = info;
            options.onSuccess(); // Successfuly determined account info
        },
        "data":
        {
            "application_id": APPLICATION_ID,
            "account_id": PLAYER.account_id,
        },
        "method": "GET",
        "url": API_url(PLAYER.domain, "wot", "account", "info"),
    });
}

function getUserTanksById(options) // Requesting API for player tanks. Options={onSuccess:function(){...}, onError:function(msg){...}}
{
    $.ajax({
        "cache": false,
        "complete": function(data)
        {
            if (data.status != 200) { // Unsuccesful request
                options.onError("Возникла ошибка при обработке запроса");
                return;
            }
            var info = JSON.parse(data.responseText).data[PLAYER.account_id];
            PLAYER.tanks = info;
            options.onSuccess(); // Successfuly determined account info
        },
        "data":
        {
            "application_id": APPLICATION_ID,
            "account_id": PLAYER.account_id,
        },
        "method": "GET",
        "url": API_url(PLAYER.domain, "wot", "account", "tanks"),
    });
}

function getClanInfo(options) // Requesting API for caln info. Options={onSuccess:function(){...}, onError:function(msg){...}}
{
    $.ajax({
        "cache": false,
        "complete": function(data)
        {
            if (data.status != 200) { // Unsuccesful request
                options.onError("Возникла ошибка при обработке запроса");
                return;
            }
            var info = JSON.parse(data.responseText).data[PLAYER.info.clan_id];
            PLAYER.clan = info;
            options.onSuccess(); // Successfuly determined account info
        },
        "data":
        {
            "application_id": APPLICATION_ID,
            "clan_id": PLAYER.info.clan_id,
        },
        "method": "GET",
        "url": API_url(PLAYER.domain, "wot", "globalmap", "claninfo"),
    });
}

function getFullInfo(onSuccess, onError) // Getting full info
{
    // Got name from form
    getUserIdByName({ // Get id from request
        "domain": "global",
        "onSuccess": function() {
            var answered_requests = 0; // Counting requests. May be done with $.when()
            var total_requests = 2;
            getUserInfoById({ // Get info from request
                "onSuccess": function() {
                    if (PLAYER.info.clan_id !== null) { // If player joined any clan
                        getClanInfo({
                            "onSuccess": function() {
                                answered_requests++;
                                if (answered_requests == total_requests) {
                                    onSuccess();
                                }
                            },
                            "onError": onError
                        });
                    } else {
                        answered_requests++;
                        if (answered_requests == total_requests) {
                            onSuccess();
                        }
                    }
                },
                "onError": onError
            });
            getUserTanksById({ // Get tanks from request
                "onSuccess": function() {
                    answered_requests++;
                    if (answered_requests == total_requests) {
                        onSuccess();
                    }
                },
                "onError": onError
            });
        },
        "onError": onError
    });
}

function timestampToDate(s) // Returning date in format
{
    var date = new Date(s * 1000); // Need ms => *1000
    var f = function(s) // Add '0' in front
    {
        if (+(s) < 10) s = "0" + s;
        return s;
    }
    return f(date.getDate()) + "." + f(date.getMonth() + 1) + "." + date.getFullYear();
}

function printPlayerFullInfo() // Printing player info
{
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Ник:</span><span class=\"result-item__value\">" + PLAYER.nickname + "</span></div>");
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Id:</span><span class=\"result-item__value\">" + PLAYER.account_id + "</span></div>");
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Зарегистрировался:</span><span class=\"result-item__value\">" + timestampToDate(PLAYER.info.created_at) + "</span></div>");
    $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Последний раз был в сети:</span><span class=\"result-item__value\">" + (PLAYER.info.logout_at == 0 ? "Не был в сети" : timestampToDate(PLAYER.info.logout_at)) + "</span></div>");



    if (PLAYER.info.statistics.all.battles) {

        $("#player-request-result").append("<div class=\"horizontal-line\"></div>");

        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Боёв сыграно:</span><span class=\"result-item__value\">" + PLAYER.info.statistics.all.battles + "</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Из них выиграно:</span><span class=\"result-item__value\">" + PLAYER.info.statistics.all.wins + " (" + Math.round(PLAYER.info.statistics.all.wins * 10000 / PLAYER.info.statistics.all.battles) / 100 + "%)</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Противников уничтожено:</span><span class=\"result-item__value\">" + PLAYER.info.statistics.all.frags + "</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Деревьев уничтожено:</span><span class=\"result-item__value\">" + PLAYER.info.statistics.trees_cut + "</span></div>");
        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Меткость:</span><span class=\"result-item__value\">" + Math.round(PLAYER.info.statistics.all.hits * 10000 / PLAYER.info.statistics.all.shots) / 100 + "%</span></div>");
    }

    if (PLAYER.clan) {

        $("#player-request-result").append("<div class=\"horizontal-line\"></div>");

        $("#player-request-result").append("<div class=\"result-item\"><span class=\"result-item__key\">Клан:</span><span class=\"result-item__value\">" + PLAYER.clan.name + "</span></div>");
    }
}
