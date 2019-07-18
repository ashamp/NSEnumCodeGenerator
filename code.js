$(function () {
  console.log('loaded');
  const enumTestCase = `//Input your NS_ENUM here
typedef NS_ENUM(NSInteger, SRReadyState) {
  SR_CONNECTING   = 0,
  SR_OPEN         = 1,
  SR_CLOSING      = 2,
  SR_CLOSED       = 3,
};`;
  console.log(enumTestCase);

  function parseNSEnum(nsenum) {

    //移除多行注释
    const multiLineComment = /\/\*[\w\W]*?\*\//gm;
    nsenum = nsenum.replace(multiLineComment, '');
    //移除单行注释
    const singleLineComment = /\/\/.*/gm;
    nsenum = nsenum.replace(singleLineComment, '');
    //取枚举体
    const body = /{[\w\W]*}/gm;
    nsenum = nsenum.match(body)[0];
    //去头'{'
    nsenum = nsenum.substring(1);
    //去尾'}'
    nsenum = nsenum.substring(0, nsenum.length - 1);
    //分组
    const enums = nsenum.split(',');
    const enumVars = [];
    for (const str of enums) {
      // console.log(str.trim());
      const enumVar = str.trim().split('=')[0].trim();
      if (enumVar.length) {
        enumVars.push(enumVar);
      }

    }
    console.log(enumVars);

    const lines = [];
    lines.push('switch (<#expression#>) {\n');
    for (const ele of enumVars) {
      lines.push(`  case ${ele}:{
    <#statements#>
    break;
  }
`);
    }
    lines.push('}');
    return lines.join('');
  }

  let objcImplStr = '';

  function generate() {
    let jsonStr = $('#enumTextarea').val();
    let nsenum = parseNSEnum(jsonStr);
    console.log(nsenum);
    objcImplStr = nsenum;
    let highlightObjcImpl = hljs.highlight('objectivec', nsenum);
    $('#objcCode').html(highlightObjcImpl.value);
  }

  function textFieldBinding(tfID, defaultValue) {
    let selector = '#' + tfID;
    let strFromCookie = $.cookie(tfID) || '';
    strFromCookie = strFromCookie.trim();
    if ((strFromCookie === undefined || strFromCookie.length === 0) && defaultValue) {
      $.cookie(tfID, defaultValue);
    }
    $(selector).val($.cookie(tfID));
    $(selector).on('input', function (e) {
      let text = $(this).val();
      $.cookie(tfID, text);
      generate();
    });
  }

  textFieldBinding('enumTextarea', enumTestCase);
  generate();

  function copyToClipboard(text) {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
  }
  $('#copyImplFileBtn').click(function () {
    copyToClipboard(objcImplStr);
  });
});