#!/usr/bin/env python
# coding: utf-8

from dd4hep import Detector
import re
from argparse import ArgumentParser
import pprint
import json

def main():
    parser = ArgumentParser()

    parser.add_argument(
        "--compact", help="DD4hep compact description xml", required=True
    )
    parser.add_argument(
        "--max_depth", help="Maximum traversal depth of the detector tree", default=10, type=int,
    )
    parser.add_argument(
        "--config_path", help="Location of produced config file", default='nothing', type=str,
    )
    parser.add_argument(
        "--hide_list", help="List of detector geometries that aren't shown", default='', type=str, nargs='+'
    )
    parser.add_argument(
        "--coloring", help="Default colours for detector (choose ild or leave blank)", default='', type=str
    )
    args = parser.parse_args()

    ## Gets the detector geometry
    theDetector = Detector.getInstance()
    theDetector.fromXML(args.compact)
    start = theDetector.world()

    ## Runs through the detector to make a tree dictionary of the detector parts
    detector_dict = tree(start, 0, args.max_depth)
    ## Processes the detector tree to make a usable config file
    subPart_processed, hidden_children = post_processing(detector_dict, list(detector_dict.keys()), '|'.join(args.hide_list[0].split(", ")), args.coloring)
    ## Produce a config.json file using the edited detector tree
    produce_config(subPart_processed, hidden_children, args.config_path)

def process_name(raw_name):
    ## Changes any numbers for parts of a detector into .* (which in regex can mean any ending)
    name = re.sub(r"\d+", ".*", raw_name)
    return name

def add_ild_colors(subdetector):
    subdetector_dict = {"Tube": [1,0.7,0.5],
                        "BeamPipe": [0,1,0],
                        "Vac": [0,0,0],
                        "VXD": [0.1,0.5,0.5],
                        "FTD": [0.39,0.1,0.57],
                        "BeamCal": [1,1,1],
                        "SIT": [0.86,0.86,0.86],
                        "SET": [0.86, 0.86, 0.86],
                        "TPC": [0.96,0.95,0],
                        "Ecal": [0.48,0.95,0],
                        "Hcal": [0.76,0.76,0.19],
                        "Yoke": [0.09,0.76,0.76],
                        "Coil": [0.28,0.28,0.86],
                        "Fcal": [0.67, 0.66, 0.67]
                        }
    for s in subdetector_dict:
        find_subdetector = re.search(f'{s}', f'{subdetector}',re.IGNORECASE)
        if find_subdetector: return subdetector_dict[s]
    return [0.57,0.63,0.81]


def tree(detElement, depth, maxDepth):
    ## Creates a detector tree using the geometry while also being able to set a max depth that the config file reaches
    nd = {}
    depth += 1
    children = detElement.children()
    for raw_name, child in children:
        if depth > maxDepth: 
            tree(child, depth, maxDepth)
        else: 
            dictionary = tree(child, depth, maxDepth)
            nd.update({raw_name: dictionary})
    return nd

def post_processing(obj, main_parts, hidden, coloring, subParts={}, sublist= [], hide_children= []):
    ## Processes the tree dictionary to make a usable config file
    for k, v in obj.items():
        if k in main_parts:
            ## Look for hidden children that we want to add to the hidden_children list and ignore
            y = re.search(f'{hidden}', f'{k}', re.IGNORECASE)
            if y == None:
                ## Removes envelopes from being featured in the final geometry
                sublist = [f'({k}_(?!envelope))\\w+|({k}(?!_))\w+']  
                outer_list = []
                outer_list.append(sublist)
                outer_list.append(0.8)

                ## Adds automatic ILD coloring if the user asks
                if coloring == "ild": 
                    color = add_ild_colors(k)
                    outer_list.append(color)

                subParts.update({str(k): outer_list})
                post_processing(v, main_parts, hidden, coloring, subParts, sublist)

            else:
                hide_children.append(f'{k}')
                sublist = []
                post_processing(v, main_parts, hidden, coloring, subParts, sublist, hide_children)
                
        else:
            k_new = process_name(f"{k}\\w+")
            ## The function ignores components with common names that can often be in multiple detectors: module, stave, layer...
            x = re.search("module|stave|layer|Calorimeter|component", k_new, re.IGNORECASE)
            if k_new not in sublist and x == None:
                sublist.append(f'{k_new}')
            post_processing(v, main_parts, hidden, coloring, subParts, sublist, hide_children)
    return subParts, hide_children
            
def produce_config(subParts, hidden, config_path):
    ## Create the final dictionary that will be converted into a config.json file
    final_dict = {"childrenToHide": hidden,
                "subParts": subParts,
                "maxLevel": 3}

    pprint.pprint(final_dict)
    with open(config_path, "w") as outfile: 
        json.dump(final_dict, outfile, indent=4)

if __name__ == '__main__':
    main()