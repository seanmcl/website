"""Generate a json index of the form index-example.json"""

import json
import os

def main():
    problem_sets = [
        {'name': 'TPTP',
         'dir': 'TPTP-v6.1.0',
         'axioms': [],
         'problems': []},

        {'name': 'ILTP-propositional',
         'dir': 'ILTP-v1.1.2-propositional',
         'axioms': [],
         'problems': []},

        {'name': 'ILTP-firstorder',
         'dir': 'ILTP-v1.1.2-firstorder',
         'axioms': [],
         'problems': []}
    ]

    def walk(obj):
        for type in ['Problems', 'Axioms']:
            for dirPath, dirs, files in os.walk(os.path.join(obj['dir'], type)):
                for filename in files:
                    size = os.path.getsize(os.path.join(dirPath, filename))
                    obj[type.lower()] += [{'file': filename, 'size': size}]

    for s in problem_sets:
       walk(s)

    with open('index.json', 'w') as f:
        json.dump(problem_sets, f, indent=2)

if __name__ == '__main__':
    main()
