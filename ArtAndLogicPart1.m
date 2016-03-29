//
//  ArtAndLogicPart1.m
//
//  Created by R Fatahi on 8/29/13.
//  Copyright (c) 2013 aug2uag. All rights reserved.
//

#import "ArtAndLogicPart1.h"

// [nr01] unsigned offset for 14-bit integers (-8192 .. 8191) to (0 .. 16383)
const int offset = 8192;

// [nr02] hi mask 00111111 10000000 (little endian)
const int hiMask = 16256;

// [nr03] lo mask 00000000 01111111 (little endian)
const int loMask = 127;

// [nr04] max hex byte val
const int maxByte = 0x7F;

// [nr05] min hex byte val
const int minByte = 0x00;

// [nr06] label rect
#define CGRECT_LABEL CGRectMake(40, 32, self.view.bounds.size.width - 80, 55);

// [nr07] text field rect
#define PORTRAIT_TEXT_FIELD CGRectMake(40, 78, self.view.bounds.size.width - 80, 60);

// [nr08] text field rect
#define LANDSCAPE_TEXT_FIELD CGRectMake(120, 78, self.view.bounds.size.width - 240, 60);

// [nr09] portrait button "encrypt"
#define PORTRAIT_ENCRYPT CGRectMake(self.view.bounds.size.width/2 - 120, 170, 110, 44);

// [nr10] portrait button "decrypt"
#define PORTRAIT_DECRYPT CGRectMake(self.view.bounds.size.width/2, 170, 110, 44);

// [nr11] landscape button "encrypt"
#define LANDSCAPE_ENCRYPT CGRectMake(18, 100, 110, 44);

// [nr12] landscape button "decrypt"
#define LANDSCAPE_DECRYPT CGRectMake(self.view.bounds.size.width - 138, 100, 110, 44);

@interface ViewController () <UITextFieldDelegate>

// [nr13] label to display results
@property (strong, nonatomic) UILabel* fLabel;

// [nr14] text field to enter text
@property (strong, nonatomic) UITextField* fTextField;

// [nr15] encrypt button option
@property (strong, nonatomic) UIButton* encryptButton;

// [nr16] decrypt button option
@property (strong, nonatomic) UIButton* decryptButton;

- (void)handleEncryption;
- (void)handleDecryption;

@end

@implementation ViewController
@synthesize fLabel, fTextField, encryptButton, decryptButton;

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // [fmt01] background
    self.view.backgroundColor = [UIColor whiteColor];
	
    // [fmt01] label field style
    fLabel = [[UILabel alloc] init];
    fLabel.text = @"Enter input and select \"encrypt\" or \"decrypt\"";
    fLabel.adjustsFontSizeToFitWidth = YES;
    fLabel.textAlignment = NSTextAlignmentCenter;
    fLabel.frame = CGRECT_LABEL;
    [self.view addSubview:fLabel];
    
    // [fmt02] text field style
    fTextField = [[UITextField alloc] init];
    fTextField.placeholder = @"enter text";
    fTextField.textAlignment = NSTextAlignmentCenter;
    fTextField.delegate = self;
    fTextField.layer.cornerRadius = 3.0f;
    fTextField.clipsToBounds = YES;
    fTextField.borderStyle = UITextBorderStyleRoundedRect;
    fTextField.autocapitalizationType = UITextAutocapitalizationTypeNone;
    fTextField.autocorrectionType = UITextAutocorrectionTypeNo;
    fTextField.layer.borderWidth = 1.0f;
    fTextField.layer.borderColor = (__bridge CGColorRef)([UIColor blackColor]);
    [self.view addSubview:fTextField];
    
    // [fmt03] encrypt button, to encrypt input if valid
    encryptButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    [encryptButton setTitle:@"ENCRYPT" forState:UIControlStateNormal];
    [encryptButton addTarget:self action:@selector(handleEncryption) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:encryptButton];
    
    // [fmt04] decrypt button, to encrypt input if valid
    decryptButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    [decryptButton setTitle:@"DECRYPT" forState:UIControlStateNormal];
    [decryptButton addTarget:self action:@selector(handleDecryption) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:decryptButton];
    
    // [fmt05] set view adjusted to portrait or landscape orientation of device
    if ([[UIDevice currentDevice] orientation] == UIInterfaceOrientationLandscapeLeft || [[UIDevice currentDevice] orientation] == UIInterfaceOrientationLandscapeRight) {
        fTextField.frame = LANDSCAPE_TEXT_FIELD;
        encryptButton.frame = LANDSCAPE_ENCRYPT;
        decryptButton.frame = LANDSCAPE_DECRYPT;
    } else {
        fTextField.frame = PORTRAIT_TEXT_FIELD;
        encryptButton.frame = PORTRAIT_ENCRYPT;
        decryptButton.frame = PORTRAIT_DECRYPT;
    }
    
}

/**
 * Encryption method.
 * escapes if not valid input.
*/
- (void)handleEncryption {
    // [cg01] detect if text field has valid number
    // [nr17] NSString to NSNumber formatter
    NSNumberFormatter * fFormatter = [[NSNumberFormatter alloc] init];
    [fFormatter setNumberStyle:NSNumberFormatterDecimalStyle];
    // [nr18] resultant NSNumber
    NSNumber * fNumber;
    
    @try {
        fNumber = [fFormatter numberFromString:fTextField.text];
    }
    @catch (NSException *exception) {
        return [self invalidEntryAlert];
    }
    @finally {
        fTextField.text = nil;
    }

    // [nr18] int conversion of fNumber
    int inputNum = [fNumber intValue];
    
    if (inputNum <= -8192 && inputNum >= 8191) {
        return [self invalidEntryAlert];
    }
    
    // [cg02] step 1: adjust value to intermediate value
    // [nr19] itermediate int value
    int intermediate = inputNum + offset;
    
    // [cg03] bitshift high mask 7 bits to adjust arrangement
    // [nr20] hex value of highMaskEval
    int highMaskEval = (intermediate & hiMask) >> 7;
    
    // [cg04] get final value to display on label
    // [nr21] string value of highMaskEval
    NSString* highHex = [NSString stringWithFormat:@"%02X", highMaskEval];
    
    // [nr22] hex value of lowMaskEval
    int lowMaskEval = (intermediate & loMask);
    
    // [nr23] string value of lowMaskEval
    NSString* lowHex = [NSString stringWithFormat:@"%02X", lowMaskEval];
    
    // [cg05] append high + low mask eval values to display
    fLabel.text = [highHex stringByAppendingString:lowHex];
    
    // [fmt10] dismiss keyboard
    [fTextField resignFirstResponder];
}

/**
 * Decryption method.
 * escapes if not valid input.
*/
- (void)handleDecryption {
    // [cg06] detect if text field has valid input
    if (fTextField.text.length != 4) {
        fTextField.text = nil;
        return [self invalidEntryAlert];
    }
    
    // [cg07] split string, convert string to hex, and validate it is within range
    // [nr24] NSString to NSNumber formatter
    NSString* inputOne = [fTextField.text substringWithRange:NSMakeRange(0, 2)];
    NSLog(@"inputOne = %@", inputOne);
    
    // [nr25] NSScanner convert string to decimal hex
    NSScanner *scanHi = [NSScanner scannerWithString:inputOne];
    unsigned int inputHi;
    [scanHi scanHexInt:&inputHi];
    NSLog(@"inputHi = %u", inputHi);
    
    // [nr26] NSScanner convert second half of string with new NSScanner object
    NSString* inputTwo = [fTextField.text substringWithRange:NSMakeRange(2, 2)];
    NSScanner *scanLo = [NSScanner scannerWithString:inputTwo];
    unsigned int inputLo;
    [scanLo scanHexInt:&inputLo];
    
    // [fmt06] clear text field
    fTextField.text = nil;
    
    // [cg08] input should fall within range, else return
    if (inputHi < minByte || inputHi > maxByte || inputLo < minByte || inputLo > maxByte) {
        return [self invalidEntryAlert];
    }
    
    // [cg09] adjust for high mask bit shift
    // [nr27] adjusted values for high mask, low mask unchanged, names match
    int finalByteLo = (int)inputLo;
    int finalByteHi = (int)inputHi << 7;
    NSLog(@"finalByteHi = %i", finalByteHi);
    NSLog(@"finalByteLo = %i", finalByteLo);
    
    // [cg10] bitwiseOr, can also be sum of values
    // [nr28] intermediate value
    int intermediate = (finalByteHi | finalByteLo);
    
    // [cg11] adjust offset
    int finalValue = intermediate - 8192;
    
    // [cg12] display to label
    fLabel.text = [NSString stringWithFormat:@"%i", finalValue];
    
    // [fmt10] dismiss keyboard
    [fTextField resignFirstResponder];
}

/**
 * Error alert method.
 * invoked if text field input is invalid.
*/
- (void)invalidEntryAlert {
    [[[UIAlertView alloc] initWithTitle:@"Error" message:@"invalid entry" delegate:nil cancelButtonTitle:@"Close" otherButtonTitles:nil, nil] show];
}

/**
 * Detecting device orientation.
 * portrait and landscape view adjustments of UI elements.
*/
- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration {
    fLabel.frame = CGRECT_LABEL;
    
    // [fmt07] update UI based on device orientation
    if (toInterfaceOrientation == UIInterfaceOrientationLandscapeLeft || toInterfaceOrientation == UIInterfaceOrientationLandscapeRight) {
        fTextField.frame = LANDSCAPE_TEXT_FIELD;
        encryptButton.frame = LANDSCAPE_ENCRYPT;
        decryptButton.frame = LANDSCAPE_DECRYPT;
    } else {
        fTextField.frame = PORTRAIT_TEXT_FIELD;
        encryptButton.frame = PORTRAIT_ENCRYPT;
        decryptButton.frame = PORTRAIT_DECRYPT;
    }
}

/**
 * Return key should be registered for text field.
 * @return YES if return should be registered, NO otherwise.
*/
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    // [fmt08] dismiss keyboard on return
    [textField resignFirstResponder];
    return YES;
}

/**
 * Detect input to text field and text field input length.
 * @return YES if input should register, NO otherwise.
*/
- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    if (textField.text.length > 8) {
        // [fmt 09] dynamic dialog for user invalid input
        NSArray* array = @[@"WHOA NELLY!", @"HOLY MOLY!", @"WOWZA!", @"YOOOOOO!", @"OH EM GEE!"];
        NSUInteger randomIndex = arc4random() % [array count];
        [[[UIAlertView alloc] initWithTitle:[array objectAtIndex:randomIndex] message:@"you can only enter so many characters" delegate:nil cancelButtonTitle:@"Close" otherButtonTitles:nil, nil] show];
        textField.text = nil;
        return NO;
    }
    
    return YES;
}

@end
