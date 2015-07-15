Parsing TPTP to Scala
=====================

There's an extensive library of problems for theorem provers called [TPTP](http://www.cs.miami.edu/~tptp/).  Each problem consists of a text file containing a formula in one of several formats.  The top of each file has interesting metadata about the problem, for example whether it's a theorem or not, how many symbols, etc.  The file may include other files.

Parsing these files into the language of your choice is a headache.  The library provides a prolog program that can convert the TPTP format into other existing formats, but this is a purely text to text tranformation.  Parsing the language directly takes some effort.  

There are a few existing parser for different languages:
- [Ocaml](https://github.com/radekm/ocaml-tptp)
- [Haskell](https://github.com/DanielSchuessler/logic-TPTP)

This morning I was searching for a parser from TPTP to Scala.  That is, I wanted to parse TPTP files into some Scala data structure representing the abstract syntax, and then I'd write a function to convert that data structure into a form I can use.   

I first looked at [Warthog](https://github.com/warthog-logic/warthog), which seems to have some TPTP parsing facility.  I found the datastructure stack overly complicated, and my timebox alert went off after 20 minutes or so at trying to figure out how to read in a TPTP file.  It was also not clear they handle include statements.

Next I tried [LeoPARD]().  Looking in the test suite, I found a [test case with an include statement](https://github.com/cbenzmueller/LeoPARD/blob/eff09b58d3ee845e252edde27c3cae546bc351a0/src/test/resources/problems/SYN000%2B2.p)!.  
