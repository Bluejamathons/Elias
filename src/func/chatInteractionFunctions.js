const { dev_username, error_reply } = require("../../config.json");
const { pronouns, negation } = require("../../keywordDefinition.json");

// STRING INCLUSION
function checkObjectOfObjectsInclusion(objectOfObjectsInput) {
    objectOfObjectsArray = []
    for (let index = 0; index < (Object.values(objectOfObjectsInput)).length; index++) {
        const element = (Object.values(objectOfObjectsInput))[index];
        for (let subindex = 0; subindex < (element.keywords).length; subindex++) {
            const subelement = element.keywords[subindex]; objectOfObjectsArray.push(subelement)
        }
    }
    if((objectOfObjectsArray).some(word => interactionContent.includes(word))) { return true } else { return false }
}
function checkObjectInclusion(objectInput) { if(((Object.values(objectInput)).join().split(",")).some(word => interactionContent.includes(word))) { return true } else { return false } }
//function checkArrayInclusion(arrayInput) { if((arrayInput).some(word => interactionContent.includes(word))) { return true } else { return false } }
function checkKeywordArrayInclusion(objectInput) { if((objectInput.keywords).some(word => interactionContent.includes(word))) { return true } else { return false } }


// PRONOUNS
function setFirstPronoun(pronounInput,pronounArrayIndexValue) { if(pronouns[pronounInput].includes(pronounArrayIndexValue)) { first_pronoun = pronounInput; first_pronoun_memory = pronounArrayIndexValue } }
function setSecondPronoun(pronounInput,pronounArrayIndexValue) { if(pronouns[pronounInput].includes(pronounArrayIndexValue)) { second_pronoun = pronounInput } }


// CONCLUSION
function getError(errorQuery) {
    return "[" + error_reply + dev_username + " Error Path: " + errorQuery + " ]"
}
function getReply(replyPath) {
    if (messageContent === "") { return replyPath[Math.floor(Math.random() * (replyPath).length)]
    } else {
        if(!([".","!","?","~"]).some(word => messageContent.charAt(messageContent.length - 1).includes(word))) { messageContent += "." }
        if(!([" "]).some(word => messageContent.charAt(messageContent.length - 1).includes(word))) { messageContent += " " }
        return messageContent + replyPath[Math.floor(Math.random() * (replyPath).length)]
    }
}


// MISC FUNCTIONS
function checkCharacter(characterInput, message) { if (message.content.toLowerCase().includes(characterInput.ping) || (message.mentions.repliedUser !== null && message.mentions.repliedUser.username.includes(characterInput.name))) { active_character = characterInput; } }
function replaceExtraneousValues(input) { return input.replace(/_|\.|\?|\*|\'|\"|-|~|!/g,"").replace(/,/g," ").replace(active_character.ping,"") }

function checkNegation() {
    if(negatedFactor > 0 && queryObject["opposite"] !== undefined) {
        if(queryObject["opposite"]["parent"] !== undefined){
            queryPath[queryPath.length - 2] = queryObject["opposite"]["parent"]
        }
        if(queryObject["opposite"]["child"] !== undefined){
            queryPath[queryPath.length - 1] = queryObject["opposite"]["child"]
        }
        negatedFactor--;
    }
}

function checkParentChildQueries(queryType) {
    // interaction_query, interaction_subquery, etc
    queryObject = queryType

    array = Object.entries(queryObject)
    for (let index_parent = 0; index_parent < array.length; index_parent++) {
        const element_parent = array[index_parent][0];
        if(checkObjectOfObjectsInclusion(queryObject[element_parent])) {
            queryPath.push(element_parent)
            queryObject = queryObject[element_parent]
            break;
        }
    }
    if(queryObject !== queryType) {
        array = Object.entries(queryObject)
        for (let index_child = 0; index_child < array.length; index_child++) {
            const element_child = array[index_child][0];
            if(checkKeywordArrayInclusion(queryObject[element_child])) {
                queryPath.push(element_child)
                queryObject = queryObject[element_child]
                break;
            }
        }
    }

    checkNegation()
}

function checkPronounQuery() {
    if(checkObjectInclusion(pronouns)) {
        first_pronoun_memory = "XXX"
        first_pronoun = ""
        second_pronoun = ""
        pronoun_type = ""
        first_pronoun_index = 10000
        second_pronoun_index = 10000
        pronounConstArray = ["first", "second", "third", "first_possessive", "second_possessive", "third_possessive"]
        pronounArray = (Object.values(pronouns)).join().split(",")
        for (let pronoun_index = 0; pronoun_index < pronounArray.length; pronoun_index++) {
            element = pronounArray[pronoun_index];
            if(interactionContent.indexOf(element) !== -1 && interactionContent.indexOf(element) <= second_pronoun_index) {
                if(interactionContent.indexOf(element) <= first_pronoun_index) {
                    if((!element.includes(first_pronoun_memory))) { second_pronoun_index = first_pronoun_index; second_pronoun = first_pronoun }
                    first_pronoun_index = interactionContent.indexOf(element)
                    for (let index_fp = 0; index_fp < pronounConstArray.length; index_fp++) { setFirstPronoun(pronounConstArray[index_fp], element) }
                } else {
                    second_pronoun_index = interactionContent.indexOf(element)
                    for (let index_sp = 0; index_sp < pronounConstArray.length; index_sp++) { setSecondPronoun(pronounConstArray[index_sp], element) }
                    if(second_pronoun === "third" && interactionContent.indexOf(element) <= interactionContent.length - 7) { second_pronoun = "third_possessive" }
                }
            }
        }
        pronoun_type = first_pronoun
        if(second_pronoun !== "") { pronoun_type += "__" + second_pronoun }
        if(!pronoun_type.includes("__") && (interactionContent.replace(first_pronoun_memory)).includes(first_pronoun_memory)) { pronoun_type += "__" + pronoun_type }
        //console.log(pronoun_type)
        queryPath.push(pronoun_type)
    }
}

function checkCharacterPathValidity() {
    characterPathObject = active_character
    for (let index = queryPath.length - 1; index >= 0; index--) {
        for (let subindex = 0; subindex <= index; subindex++) {
            if(characterPathObject[queryPath[subindex]] !== undefined) {
                characterPathObject = characterPathObject[queryPath[subindex]]
            } else {
                break;
            }
        }
        if(Array.isArray(characterPathObject) || characterPathObject["default"] !== undefined) {
            if(characterPathObject["default"] !== undefined) {
                characterPathObject = characterPathObject["default"]
            }
            break;
        } else {
            characterPathObject = active_character
        }
    }
    
    if(characterPathObject["invalid_query"] !== undefined) {
        characterPathObject = characterPathObject["invalid_query"]
    }
}

function setSentenceArray(msg) {
    readableSentenceArray = []
    if(msg.indexOf(".") !== -1 || msg.indexOf("!") !== -1 || msg.indexOf("?") !== -1 || msg.indexOf("~") !== -1) {
        sentenceArray = msg.split(/!|\.|\?|~/)
        for (let index = 0; index < sentenceArray.length; index++) {
            if(replaceExtraneousValues(sentenceArray[index]).replace(/ /g,"") !== "") {
                readableSentenceArray.push(replaceExtraneousValues(sentenceArray[index]))
            }
        }
    } else { readableSentenceArray.push(replaceExtraneousValues(msg)) }
}

function setNegation() {
    rx = new RegExp(negation.join("|"), "g")
    var x = interactionContent.match(rx) || []
    if(x.length % 2 === 0 && x.length > 0){ negatedFactor = 2 } else if(x.length % 2 !== 0) { negatedFactor = 1 } else { negatedFactor = 0 }
}

function checkPreviousQuery() {
    var char = active_character
    if(queryPath.length > 0) {
        var txt = ""
        for (let index = 0; index < queryPath.length; index++) {
            if(char[queryPath[index]] !== undefined) {
                char = char[queryPath[index]]
                if(index !== 0) { txt += "." }
                txt += queryPath[index]
            }
        }
        if(queryPrevious.includes(txt)) {
            return false;
        }
        else {
            queryPrevious.push(txt)
            return true;
        }
    }
}

module.exports = { getError, getReply, replaceExtraneousValues, checkNegation, setFirstPronoun, setSecondPronoun, checkParentChildQueries, checkObjectInclusion, checkPronounQuery, checkCharacter, checkCharacterPathValidity, setNegation, setSentenceArray, checkPreviousQuery }