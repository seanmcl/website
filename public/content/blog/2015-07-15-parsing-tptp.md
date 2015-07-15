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

Here's an example TPTP file: AGT001+1.p

    %--------------------------------------------------------------------------
    % File     : AGT001+1 : ILTP v1.1.2
    % Domain   : Agents
    % Problem  : Problem for the CPlanT system
    % Version  : [Bar03] axioms : Especial.
    % English  :

    % Refs     : [Bar03] Barta, J. (2003), Email to G. Sutcliffe
    %          : [BT+03] Barta et al. (2003), Meta-Reasoning in CPlanT Multi-Ag
    %          : [TBP03] Tozicka et al. (2003), Meta-reasoning for Agents' Priv
    % Source   : [Bar03]
    % Names    :

    % Status   : Theorem
    % Rating   : 0.18 v3.1.0
    %
    % Status (intuit.) : Theorem
    % Rating (intuit.) : 0.50 v1.0.0
    %
    % Syntax   : Number of formulae    :  556 ( 524 unit)
    %            Number of atoms       :  656 (   2 equality)
    %            Maximal formula depth :    8 (   1 average)
    %            Number of connectives :  143 (  43 ~  ;   1  |;  67  &)
    %                                         (  16 <=>;  16 =>;   0 <=)
    %                                         (   0 <~>;   0 ~|;   0 ~&)
    %            Number of predicates  :   17 (   0 propositional; 1-4 arity)
    %            Number of functors    :  290 ( 286 constant; 0-2 arity)
    %            Number of variables   :   70 (   0 singleton;  70 !;   0 ?)
    %            Maximal term depth    :    5 (   1 average)

    % Comments :
    % Bugfixes : v3.0.0 - Bugfixes in NUM005+1.ax
    %          : v3.1.0 - Changes to NUM005 axioms
    %--------------------------------------------------------------------------
    %----Include axioms of CPlanT
    include('Axioms/AGT001+0.ax').
    %----Include events of CPlanT
    include('Axioms/AGT001+1.ax').
    %----Include axioms for RDN and RDN less
    include('Axioms/NUM005+0.ax').
    include('Axioms/NUM005+1.ax').
    %--------------------------------------------------------------------------
    fof(query_1,conjecture,
        ( accept_team(countryamedicalorganization,countryacivilorganization,towna,n6) )).

    %--------------------------------------------------------------------------


Let's try to parse it with Leo.



    import leo.modules.parsers.TPTP
    import scala.io.Source
    import scala.util.parsing.input.CharArrayReader
    val file = "/tmp/TPTP-v6.1.0/Problems/AGT/AGT001+1.p"
    val x = TPTP.parseFile(new CharArrayReader(Source.fromFile(file).toArray))

    x: Either[String,leo.datastructures.tptp.Commons.TPTPInput] = 
      Right(TPTPInput(List(Right((Axioms/AGT001+0.ax,List())), 
                           Right((Axioms/AGT001+1.ax,List())), 
                           Right((Axioms/NUM005+0.ax,List())), 
                           Right((Axioms/NUM005+1.ax,List())), 
                          Left(fof(query_1,conjecture,(accept_team(
                            countryamedicalorganization,countryacivilorganization,towna,n6))).))))

Hmm, this is good progress, but the Axioms are still in there.  Can I get them to expand?  After searching around, it appears the answer is no.  But the nice thing about abstract syntax is it's easy to get what you want out of it.
Since there are 4 axioms, I'll need to call the parser on those and create the formula Ax1 ⊃ Ax2 ⊃ Ax3 ⊃ Ax4 ⊃ f.

    import leo.datastructures.tptp.Commons.{FOFAnnotated, TPTPInput}
    import leo.modules.parsers.TPTP
    import scala.io.Source
    import scala.util.parsing.input.CharArrayReader
    import leo.datastructures.tptp.fof._

    val tptpHome = "/tmp/TPTP-v6.1.0"

    def getIncludesAndFormulas(f: String) = { // : Either[String, (List[String], List[_])] = {
    val file = s"$tptpHome/$f"
      TPTP.parseFile(new CharArrayReader(Source.fromFile(file).toArray)) match {
        case Left(err) => Left(err)
        case Right(input) => {
          val includes = input.getIncludes.map(_._1)
          val formulas = input.getFormulae
          Right((includes, formulas))
        }
      }
    }

    def getFormula(file: String): LogicFormula = {
      getIncludesAndFormulas(file) match {
        case Right((includes, formulas)) => formulas match {
          case FOFAnnotated(_, _, f, _) :: rest => f match {
            case Logical(g) => {
              val hyps = includes map getFormula
              hyps.foldRight(g)((x, y) => Binary(x, Impl, y))
            }
          }
        }
      }
    }

    val f = getFormula("Problems/AGT/AGT001+1.p")

`f` now has the implication I was looking for, and I can walk over it to create the data structure of my choice.
Of course, not all TPTP problems are in the FOF format, so this little experiment will need a lot of tweaking, but it's a lot easier than writing a parser for the TPTP BNF.

Thank you Leo III team!


